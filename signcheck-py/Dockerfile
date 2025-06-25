# Use the official Python image from the Docker Hub
FROM python:3.9.6

# Set the working directory in the container
WORKDIR /app

# Copy the requirements file into the container
COPY requirements.txt .

# Install the required Python packages
RUN pip install --no-cache-dir -r requirements.txt

# Copy the application files
COPY . .

# Make the start script executable
RUN chmod +x start.sh

# Environment variables with defaults
ENV HOST=0.0.0.0
ENV PORT=8000

VOLUME ["/app/cert"]

# Expose the port that the FastAPI app will run on
EXPOSE 8000

# Command to run the FastAPI app using the start script
CMD ["./start.sh"]
