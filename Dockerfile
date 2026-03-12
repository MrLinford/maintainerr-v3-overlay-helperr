# Use the official PowerShell image
FROM mcr.microsoft.com/powershell:latest

# Install necessary packages
RUN apt-get update && \
    apt-get install -y --no-install-recommends \
    libgdiplus \
    libc6-dev \
    imagemagick \
    cron \
    && apt-get clean && rm -rf /var/lib/apt/lists/*

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