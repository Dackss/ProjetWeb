FROM php:8.2-apache

RUN docker-php-ext-install pdo pdo_mysql

RUN a2enmod rewrite
COPY backend/000-default.conf /etc/apache2/sites-available/000-default.conf

RUN echo "opcache.enable=0" > /usr/local/etc/php/conf.d/opcache-dev.ini

# Python : utilisé par predictions.php via exec() pour appeler les scripts ia/scripts/*.py
RUN apt-get update && apt-get install -y --no-install-recommends python3 python3-pip \
    && rm -rf /var/lib/apt/lists/*
RUN pip3 install --no-cache-dir --break-system-packages scikit-learn pandas numpy joblib pymysql

COPY backend/ /var/www/html/
COPY ia/ /var/www/html/ia/
