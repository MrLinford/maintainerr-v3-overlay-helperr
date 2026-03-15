<p align="center">
  <img src="img/logo.png" alt="Logo" width="200" height="200/>
    <br>
</p>

<p align="center" >
  <br>
<!-- Latest Build -->  <picture><img alt="GitHub Actions Workflow Status" src="https://img.shields.io/github/actions/workflow/status/gssariev/maintainerr-overlay-helperr/.github%2Fworkflows%2Fdocker-image.yml?branch=main&style=flat&logo=github&label=Latest%20Build"></picture>
<!-- Latest Release -->  <a href="https://github.com/gssariev/maintainerr-overlay-helperr/releases"><img alt="GitHub Release" src="https://img.shields.io/github/v/release/gssariev/maintainerr-overlay-helperr?style=flat&logo=github&logoColor=white&label=Latest%20Release"></a>
<!-- Commits -->  <picture><img alt="GitHub commits since latest release" src="https://img.shields.io/github/commits-since/gssariev/maintainerr-overlay-helperr/latest?style=flat&logo=github&logoColor=white"></picture>
<!-- Github Stars -->  <picture><img alt="GitHub Repo stars" src="https://img.shields.io/github/stars/gssariev/maintainerr-overlay-helperr?style=flat&logo=github&logoColor=white&label=Stars"></picture>
<!--Commits per month -->  <picture><img alt="GitHub commit activity" src="https://img.shields.io/github/commit-activity/m/gssariev/maintainerr-overlay-helperr?style=flat&logo=github&logoColor=white&label=COMMITS"></picture>
<!-- Issues Closed -->  <picture><img alt="GitHub Issues or Pull Requests" src="https://img.shields.io/github/issues-closed/gssariev/maintainerr-overlay-helperr?style=flat&logo=github&logoColor=white"></picture>
<!-- Issues Open -->  <picture><img alt="GitHub Issues or Pull Requests" src="https://img.shields.io/github/issues/gssariev/maintainerr-overlay-helperr?style=flat&logo=github&logoColor=white"></picture>
<!-- License -->  <picture><img alt="GitHub License" src="https://img.shields.io/github/license/gssariev/maintainerr-overlay-helperr?style=flat"></picture>
</p>

# Maintainerr Overlay Helperr

**Project inspired by [Maintainerr Poster Overlay](https://gitlab.com/jakeC207/maintainerr-poster-overlay)**

This project is a helper script that works with [Maintainerr](https://github.com/jorenn92/Maintainerr) to add a Netflix-style "leaving soon" overlay to your media. It integrates with Plex and Maintainerr to download posters, add overlay text, and upload the modified posters back to Plex. It runs periodically to ensure posters are updated with the correct information.

### AI DISCLOSURE
- This is **NOT** a vibe coded project
- Claude has been used to help rewrite the original Powershell script into React
- AI can only do so much with my spaghetti code and ideas
### Using Calculated Date

<img alt="Using Calculated Date" src="img/using-calculated-date.png">

### Using Days Left

<img alt="Using Days Left" src="img/using-days-left.png" />

### Features

- **Collections**: All types of collections are supported. The script can process multiple collections at once and reorder each Plex collection in ascending or descending order based on deletion date, allowing you to easily manage upcoming removals.
- **Customizable overlay**: use custom text, colour, size, shape & positioning of the overlay
- **Overlay reset & deletion**: revert to the original poster & delete the generated overlay poster from the Plex metadata folder
- **Automatic poster update**: The overlay's deletion date automatically updates to match any modifications you make to Maintainerr rules, ensuring your visual overlays always reflect the latest media removal schedules.
- **Display days left vs exact date**: choose between showing the calculated date of removal (Netflix style) or days leading up to it (countdown)
- **CRON scheduling**: schedule when the script should run using CRON expressions

### Requirements

- [Docker](https://www.docker.com/get-started/)
- [Plex Media Server](https://github.com/linuxserver/docker-plex)
- [Maintainerr](https://github.com/Maintainerr/Maintainerr)

## Usage

#### Docker-compose:

```Yaml
services:
  maintainerr-overlay-helperr:
    image: maintainerr-overlay-helperr:develop
    container_name: maintainerr-overlay-helperr
    ports:
      - "3000:3000"
    volumes:
      - /path/to/data:/data           # config.json + state + saved posters
      - /path/to/fonts:/fonts         # custom .ttf fonts (optional)
    environment:
      - PLEX_URL=http://your-plex-host:32400
      - PLEX_TOKEN=your-plex-token
      - MAINTAINERR_URL=http://your-maintainerr-host:6246

    restart: unless-stopped

```
You can now access the UI at http://localhost:3000
