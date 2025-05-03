FROM python:3.10.14-slim-bookworm

WORKDIR /app

COPY requirements.txt .

# Install system dependencies
RUN apt-get update && \
    apt-get install -y libgl1 libglib2.0-0 && \
    apt-get clean && rm -rf /var/lib/apt/lists/*

# Install Python dependencies
RUN pip install -r requirements.txt

# Copy the rest of the code
COPY . .

# Run the application
CMD ["python", "main.py"]
