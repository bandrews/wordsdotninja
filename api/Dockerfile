# API Dockerfile - Multi-stage build
#
# Uses nutrimatic as a builder, downloads pre-built indexes,
# produces a self-contained image for deployment
#

# Stage 1: Build nutrimatic binaries
FROM ubuntu:22.04 AS builder

RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    curl \
    python3.10 \
    python3-pip \
    python3.10-venv \
    git \
    pkg-config \
    && rm -rf /var/lib/apt/lists/*

RUN update-alternatives --install /usr/bin/python3 python3 /usr/bin/python3.10 1

# Install mise
RUN curl https://mise.run | sh
ENV PATH="/root/.local/bin:${PATH}"

WORKDIR /build

# Copy nutrimatic build configuration
COPY nutrimatic/mise.toml ./
COPY nutrimatic/conanfile.py ./

# Setup mise and install Python tools
RUN mise trust && mise install

# Install conan and build tools via pip
RUN mise exec -- python3 -m pip install conan==2.15.1 cmake==3.28.3

# Setup conan profile
ENV CONAN_HOME="/build/conan.tmp"
RUN mise exec -- conan profile detect --name=default --force && \
    echo 'compiler.cppstd=17' >> /build/conan.tmp/profiles/default

# Copy source code
COPY nutrimatic/source/ ./source/

# Install dependencies and build
RUN mise exec -- conan install . --build=missing --settings=build_type=Release -v
RUN mise exec -- conan build . -v

# Collect binaries
RUN mkdir -p /binaries && find build -maxdepth 1 -type f -executable -exec cp {} /binaries/ \;

# Stage 2: Download index files (separate layer for better caching)
FROM ubuntu:22.04 AS indexer

RUN apt-get update && apt-get install -y --no-install-recommends \
    curl \
    ca-certificates \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /data

# Download wikipedia index (1.1GB - cached in its own layer)
RUN curl -L -o wikipedia.index \
    https://github.com/bandrews/wordsdotninja/releases/download/wikipedia.2025-05-21/wikipedia-2025-05-21.index

# Download 12dicts index (smaller)
RUN curl -L -o 12dicts.index \
    https://github.com/bandrews/wordsdotninja/releases/download/wikipedia.2025-05-21/12dicts.index

# Stage 3: Final runtime image
FROM python:3.11-slim

WORKDIR /app

RUN apt-get update && apt-get install -y --no-install-recommends \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Install Python dependencies
COPY api/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy find-expr binary from builder
COPY --from=builder /binaries/find-expr /usr/local/bin/find-expr
RUN chmod +x /usr/local/bin/find-expr

# Copy index files from indexer
COPY --from=indexer /data/ /data/

# Copy application code
COPY api/main.py ./

# Configuration
ENV NUTRIMATIC_FIND_EXPR=/usr/local/bin/find-expr
ENV NUTRIMATIC_MAX_COMPUTATION=1000000
ENV NUTRIMATIC_CPU_LIMIT=30
ENV NUTRIMATIC_MEMORY_LIMIT=2147483648

EXPOSE 8000

HEALTHCHECK --interval=30s --timeout=30s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:8000/health || exit 1

CMD ["python3", "-m", "uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
