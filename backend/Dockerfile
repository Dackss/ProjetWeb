FROM php:8.2-apache

RUN docker-php-ext-install pdo pdo_mysql

# Opcache désactivé : le code monté en volume change souvent en dev,
# et la détection des changements de fichier est peu fiable sur ce volume
RUN echo "opcache.enable=0" > /usr/local/etc/php/conf.d/opcache-dev.ini

# Python : utilisé par predictions.php via exec() pour appeler les scripts ia/scripts/*.py
RUN apt-get update && apt-get install -y --no-install-recommends python3 python3-pip \
    && rm -rf /var/lib/apt/lists/*
RUN pip3 install --no-cache-dir --break-system-packages scikit-learn pandas numpy joblib
