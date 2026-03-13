# Use the official PowerShell image
FROM mcr.microsoft.com/powershell:latest

# Install necessary packages
RUN apt-get update && \
    apt-get install -y --no-install-recommends \
    libgdiplus \
    libc6-dev \
    imagemagick \
    && apt-get clean && rm -rf /var/lib/apt/lists/*

# Latest releases available at https://github.com/aptible/supercronic/releases
ENV SUPERCRONIC_URL=https://github.com/aptible/supercronic/releases/download/v0.2.44/supercronic-linux-amd64 \
    SUPERCRONIC_SHA1SUM=6eb0a8e1e6673675dc67668c1a9b6409f79c37bc \
    SUPERCRONIC=supercronic-linux-amd64

RUN curl -fsSLO "$SUPERCRONIC_URL" \
    && echo "${SUPERCRONIC_SHA1SUM}  ${SUPERCRONIC}" | sha1sum -c - \
    && chmod +x "$SUPERCRONIC" \
    && mv "$SUPERCRONIC" "/usr/local/bin/${SUPERCRONIC}" \
    && ln -s "/usr/local/bin/${SUPERCRONIC}" /usr/local/bin/supercronic

# Create symlink for magick
RUN ln -s /usr/bin/convert /usr/bin/magick

# Copy the PowerShell script and fonts into the container
COPY maintainerr_days_left.ps1 /maintainerr_days_left.ps1
COPY AvenirNextLTPro-Bold.ttf /fonts/AvenirNextLTPro-Bold.ttf

# --- ADDED STEPS FOR ENTRYPOINT ---
# Copy the entrypoint script into the container
COPY docker-entrypoint.sh /docker-entrypoint.sh

# Give the script execution permissions
RUN chmod +x /docker-entrypoint.sh
# ----------------------------------

# Set the working directory
WORKDIR /

# Set the entrypoint to run the script
ENTRYPOINT ["/docker-entrypoint.sh"]