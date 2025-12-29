# Nutrimatic - Complete build and runtime image
#
# Use cases:
# 1. As a builder stage: COPY --from=nutrimatic /app/bin/find-expr /usr/local/bin/
# 2. Run CGI frontend: docker run -v ./data:/data -p 8080:80 nutrimatic
# 3. Build indexes: docker run -v ./wikipedia:/input -v ./data:/output nutrimatic make-index ...
#
FROM ubuntu:22.04

# Install build dependencies
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

# Install mise for build tooling
RUN curl https://mise.run | sh
ENV PATH="/root/.local/bin:${PATH}"

WORKDIR /app

# Copy build configuration (for layer caching)
COPY mise.toml conanfile.py ./

# Setup mise and install Python tools
RUN mise trust && mise install

# Install conan and build tools via pip
RUN mise exec -- python3 -m pip install conan==2.15.1 cmake==3.28.3

# Setup conan profile
ENV CONAN_HOME="/app/conan.tmp"
RUN mise exec -- conan profile detect --name=default --force && \
    echo 'compiler.cppstd=17' >> /app/conan.tmp/profiles/default

# Copy C++ source
COPY source/ ./source/

# Install dependencies and build
RUN mise exec -- conan install . --build=missing --settings=build_type=Release
RUN mise exec -- conan build .

# Install binaries to /app/bin
RUN mkdir -p /app/bin && \
    find build -maxdepth 1 -type f -executable -exec cp {} /app/bin/ \;

# Add binaries to PATH
ENV PATH="/app/bin:${PATH}"

# Create data directory mount point
RUN mkdir -p /data

# Default: show available commands
CMD ["sh", "-c", "echo 'Nutrimatic tools available:' && ls /app/bin && echo '' && echo 'Mount index files to /data and run find-expr, or use as builder stage'"]
