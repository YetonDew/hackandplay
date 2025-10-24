from PyPDF2 import PdfReader
from langchain.text_splitter import RecursiveCharacterTextSplitter
import os
from langchain_google_genai import GoogleGenerativeAIEmbeddings
from langchain_community.vectorstores import FAISS
from langchain.prompts import PromptTemplate
from langchain.chains.combine_documents import create_stuff_documents_chain
from dotenv import load_dotenv, find_dotenv
from langchain_google_vertexai import VertexAI
from io import BytesIO
from ..services.cloud_storage import get_pdf_from_gcs

load_dotenv(find_dotenv())

API_KEY = os.getenv('GEMINI_API_KEY')

def byte_pdf_to_text(pdf_content):
    try:
        pdf_reader = PdfReader(BytesIO(pdf_content))
        for page in pdf_reader.pages:
            text += page.extract_text()
        print(text)
        return text
    except Exception as e:
        print(f"Error reading PDF: {e}")

def get_text_chunks(text):
    text_splitter = RecursiveCharacterTextSplitter(chunk_size=10000, chunk_overlap=1000)
    chunks = text_splitter.split_text(text)
    return chunks

def get_vector_store(text_chunks):
    embeddings = GoogleGenerativeAIEmbeddings(model = "models/embedding-001", google_api_key=API_KEY)
    return FAISS.from_texts(text_chunks, embedding=embeddings)

def get_conversational_chain():
    prompt_template = """
    Answer the question as detailed as possible from the provided context, make sure to provide all the details, if the answer is not in
    provided context just say, "answer is not available in the context", don't provide the wrong answer\n\n
    Context:\n {context}?\n
    Question: \n{question}\n
    Answer:
    """

    model = VertexAI(model_name="gemini-2.0-flash")
    prompt = PromptTemplate(template=prompt_template, input_variables=["context", "question"])
    chain = create_stuff_documents_chain(llm=model, prompt=prompt)
    return chain

def user_input(user_question, vector_store):
    docs = vector_store.similarity_search(user_question)    
    chain = get_conversational_chain()
    response = chain.invoke({"context": docs, "question": user_question})
    print(response)

async def generate_response(pdf_names, user_input):
    raw_text = ''
    for pdf in pdf_names:
        pdf_reader = PdfReader(BytesIO(get_pdf_from_gcs(pdf)))
        for page in pdf_reader.pages:
            raw_text += page.extract_text()

    text_chunks = get_text_chunks(raw_text)
    vector_store = get_vector_store(text_chunks)
    print("PDF processing and vector store creation complete")
    docs = vector_store.similarity_search(user_input)
    chain = get_conversational_chain()
    response = await chain.ainvoke({"context": docs, "question": user_input})
    # model = VertexAI(model_name="gemini-2.0-flash")
    # response = await model.ainvoke(user_input)
    return response