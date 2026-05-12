FROM python:3.11-slim

WORKDIR /app

COPY requirements.txt .
RUN grep -v "emergentintegrations" requirements.txt > requirements_filtered.txt \
    && pip install --no-cache-dir -r requirements_filtered.txt

COPY . .

EXPOSE 8080

CMD ["uvicorn", "server:app", "--host", "0.0.0.0", "--port", "8080"]