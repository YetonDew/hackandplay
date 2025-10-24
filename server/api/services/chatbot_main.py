from PyPDF2 import PdfReader
from langchain.text_splitter import RecursiveCharacterTextSplitter
import os
from langchain_google_genai import GoogleGenerativeAIEmbeddings
from langchain_community.vectorstores import FAISS
from langchain.prompts import PromptTemplate
from langchain.chains.combine_documents import create_stuff_documents_chain
from dotenv import load_dotenv, find_dotenv
from langchain_google_vertexai import VertexAI

import glob

load_dotenv(find_dotenv())

API_KEY = os.getenv('GEMINI_API_KEY')


def get_pdf_text(pdf_docs):
    text=""
    for pdf in pdf_docs:
        pdf_reader= PdfReader(pdf)
        for page in pdf_reader.pages:
            text+= page.extract_text()
    return  text

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
    print(type(response))


def main():

    pdf_files = glob.glob("*.pdf")
    if not pdf_files:
        print("No PDF files found in the current directory.")
        return

    print("Found the following PDF files:")
    for pdf in pdf_files:
        print(" -", pdf)
    
    print("\nProcessing PDF files...")
    raw_text = get_pdf_text(pdf_files)
    text_chunks = get_text_chunks(raw_text)
    vector_store = get_vector_store(text_chunks)
    print("PDF processing and vector store creation complete.\n")

    while True:
        user_question = input("Enter your question (or type 'exit' to quit): ")
        if user_question.strip().lower() == "exit":
            print("Exiting.")
            break
        user_input(user_question, vector_store)
        print("-" * 40)



if __name__ == "__main__":
    main()