# app/vector_store.py
from langchain_chroma import Chroma
from langchain_huggingface import HuggingFaceEmbeddings
from langchain.text_splitter import RecursiveCharacterTextSplitter

# Define the path for the persistent ChromaDB database
CHROMA_PATH = "chroma_db"

# Use a pre-trained model from Hugging Face for creating embeddings
# This model is powerful and runs locally.
EMBEDDING_MODEL = "all-MiniLM-L6-v2"

def get_vector_store():
    """
    Initializes and returns the Chroma vector store with a HuggingFace embedding model.
    """
    # Initialize the embedding function using the new package
    embedding_function = HuggingFaceEmbeddings(
        model_name=EMBEDDING_MODEL,
        model_kwargs={'device': 'cpu'} # Use CPU for broad compatibility
    )

    # Initialize a Chroma vector store client using the new package
    # This will create the database directory if it doesn't exist
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

    # Initialize the vector store
    db = get_vector_store()
    
    # Create a text splitter to break down large documents into smaller chunks
    text_splitter = RecursiveCharacterTextSplitter(
        chunk_size=1000,  # Max size of each chunk
        chunk_overlap=100, # Overlap between chunks to maintain context
        length_function=len
    )
    chunks = text_splitter.create_documents(documents) # This creates Document objects
    
    print(f"--> Adding {len(chunks)} chunks to the vector store...")

    # Add the chunks to the database.
    # ChromaDB handles the embedding and storage automatically.
    db.add_documents(chunks)
    
    # The db.persist() call has been removed as it's no longer needed.
    print("--> Documents added to the store.")

