from openai import OpenAI
import psycopg2
from psycopg2.extras import RealDictCursor
from dotenv import load_dotenv
import os

load_dotenv()
DB_URL = os.getenv("DATABASE_URL")
KEY = os.getenv("API_KEY")

client= OpenAI(
    base_url = "https://api.scaleway.ai/8a6d212d-73c8-46cd-95f9-6d111cf79241/v1",
    api_key = "82e7772a-9978-489f-b0d8-d5ca693336bc" # Replace SCW_SECRET_KEY with your IAM API key
)

async def get_answer(conversation):
    data = collect_user_info(conversation)
    answer = ''
    if data['is_complete']:
        answer = run_rag_pipeline(data.user_summary)
    else:
        answer = data['assistant']
    return answer

def embed_text(text: str):
    response = client.embeddings.create(
        input=text,
        model="bge-multilingual-gemma2",
    )
    return response.data[0].embedding


def retrieve_context(query: str, top_k: int = 1):
    embedding = embed_text(query)
    conn = psycopg2.connect(DB_URL)
    cur = conn.cursor(cursor_factory=RealDictCursor)

    cur.execute("""
        SELECT content,
               1 - (embedding <#> %s::vector) AS similarity
        FROM items
        ORDER BY embedding <#> %s::vector
        LIMIT %s;
    """, (embedding, embedding, top_k))

    rows = cur.fetchall()
    cur.close()
    conn.close()

    return [row.content for row in rows]


def collect_user_info(conversation: list[dict]) -> dict:
    system_prompt = {
        "role": "system",
        "content": (
            "You are a helpful assistant that collects information from the user "
            "to prepare a personalized offer search. "
            "Ask clarifying questions until you have all necessary details. "
            "Once you have enough information, clearly say: 'OK, I have all the data.'"
        ),
    }

    messages = [system_prompt] + conversation

    response = client.chat.completions.create(
        model="qwen3-235b-a22b-instruct-2507",
        messages=messages,
        max_tokens=512,
        temperature=0.7,
        top_p=0.8,
        presence_penalty=0,
        stream=False,
    )

    reply = response.choices[0].message.content.strip()
    is_complete = any(
        phrase in reply.lower()
        for phrase in ["i have all the data", "mam wszystko"]
    )

    user_summary = " ".join(
        m.content for m in conversation if m.role == "user"
    )

    return {
        "assistant": reply,
        "is_complete": is_complete,
        "user_summary": user_summary if is_complete else None,
    }


def run_rag_pipeline(user_summary: str) -> str:
    """
    Przyjmuje podsumowanie potrzeb użytkownika (tekst),
    wyszukuje kontekst w bazie i generuje finalną odpowiedź.
    """
    context = retrieve_context(user_summary, 1)
    context_text = "\n\n".join(context)

    prompt = f"""
            User's needs summary:
            {user_summary}

            Based on the context below, generate the best personalized offer or response.
            Shortlly explain your reasoning

            Context:
            {context_text}
            """

    response = client.chat.completions.create(

        model="qwen3-235b-a22b-instruct-2507",
        messages=[
                { "role": "system", "content": prompt},
                { "role": "user", "content": "" },
        ],
        max_tokens=512,
        temperature=0.7,
        top_p=0.8,
        presence_penalty=0,
        stream=True
    )

    return response.choices[0].message.content.strip()