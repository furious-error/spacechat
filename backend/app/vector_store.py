# app/vector_store.py
from langchain_chroma import Chroma
from langchain_huggingface import HuggingFaceEmbeddings
from langchain.text_splitter import RecursiveCharacterTextSplitter

CHROMA_PATH = "chroma_db"

EMBEDDING_MODEL = "all-MiniLM-L6-v2"

def get_vector_store():
    """
    Initializes and returns the Chroma vector store with a HuggingFace embedding model.
    """
    embedding_function = HuggingFaceEmbeddings(
        model_name=EMBEDDING_MODEL,
        model_kwargs={'device': 'cpu'} 
    )

    db = Chroma(
        persist_directory=CHROMA_PATH,
        embedding_function=embedding_function
    )
    return db

def add_documents_to_store(documents: list[str]):
    """
    Splits documents, creates embeddings, and adds them to the vector store.
    
    Args:
        documents (list[str]): A list of document texts to add.
    """
    if not documents:
        return

    db = get_vector_store()
    
    text_splitter = RecursiveCharacterTextSplitter(
        chunk_size=1000, 
        chunk_overlap=100,
        length_function=len
    )
    chunks = text_splitter.create_documents(documents)
    
    print(f"--> Adding {len(chunks)} chunks to the vector store...")

    db.add_documents(chunks)
    
    print("--> Documents added to the store.")

