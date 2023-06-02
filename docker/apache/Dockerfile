FROM php:8.2-apache

RUN apt-get update \
&& apt-get install -y \
&& apt-get autoremove -y \
&& docker-php-ext-install mysqli pdo pdo_mysql \
&& apt-get install curl -y \
&& apt-get install git -y \
&& apt-get install zip -y \
&& apt-get install npm -y \
&& curl -sS https://get.symfony.com/cli/installer | bash \
&& mv /root/.symfony5/bin/symfony /usr/local/bin/symfony

COPY --from=composer /usr/bin/composer /usr/bin/composer

RUN npm install npm@latest -g && \
    npm install n -g && \
    n latest

EXPOSE 8080

WORKDIR /usr/src/app

COPY . .

RUN npm install
RUN composer install
