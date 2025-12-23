# Deployment Guide

This guide explains how to deploy the King Neon project to a VPS using Docker.

## Prerequisites

- **Docker** and **Docker Compose** installed on the VPS.
- **Git** installed.
- **Domain name** (optional, recommended for production).

## Deployment Steps

1.  **Clone the Repository**

    ```bash
    git clone <your-repo-url>
    cd king-neon
    ```

2.  **Environment Setup**
    Create a `.env` file in the root directory. You can copy the example:

    ```bash
    cp .env.example .env
    ```

    **Critical:** Update the values in `.env` for production, especially:
    - `POSTGRES_PASSWORD`
    - `MINIO_ROOT_PASSWORD`
    - `JWT_SECRET`, `API_TOKEN_SALT`, `ADMIN_JWT_SECRET` etc. (for Strapi/NestJS)
    - `NEXT_PUBLIC_API_URL` (should point to your VPS domain/IP)

3.  **Build and Run**
    Run the production docker-compose file:

    ```bash
    docker compose -f docker-compose.prod.yml up -d --build
    ```

    - `-d`: Detached mode (runs in background)
    - `--build`: Forces rebuilding images

4.  **Verify Services**
    Check connection logs and status:
    ```bash
    docker compose -f docker-compose.prod.yml logs -f
    ```

## Accessing Applications

By default, the services map to these ports:

- **Web Storefront**: `http://<vps-ip>:3000`
- **Admin Dashboard**: `http://<vps-ip>:3001`
- **API**: `http://<vps-ip>:4000`
- **CMS**: `http://<vps-ip>:1337`

> **Note:** For a production environment, it is highly recommended to set up a reverse proxy like **Nginx** or **Traefik** to handle SSL (HTTPS) and route domains (e.g., `kingneon.com`, `admin.kingneon.com`) to these ports.

## Updates

To update the application:

1.  `git pull`
2.  `docker compose -f docker-compose.prod.yml up -d --build`
