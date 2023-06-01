FROM php:8.2-rc-apache-buster

# Install NodeJS & NPM
RUN curl -fsSL https://deb.nodesource.com/setup_14.x | bash - \
 && apt-get install -y nodejs \
 && npm install

# Composer
RUN curl -sS https://getcomposer.org/installer | php -- --install-dir=/usr/local/bin --filename=composer

# Symfony CLI
RUN wget https://github.com/symfony-cli/symfony-cli/releases/download/v5.5.6/symfony-cli_linux_amd64.tar.gz \
 && tar -xvzf symfony-cli_linux_amd64.tar.gz \
 && chmod +x symfony \
 && mv symfony /usr/local/bin/

# Cleanup
RUN rm -rf /usr/src/* \
 && rm -rf /var/lib/apt/lists/*

WORKDIR /usr/src/app

COPY composer.* .

RUN composer install

COPY package*.json .

RUN npm install

COPY . .

RUN symfony server:start