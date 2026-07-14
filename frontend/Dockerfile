FROM nginx:alpine

# Copy all frontend files
COPY . /usr/share/nginx/html

# nginx config: serve welcome.html as the default index
RUN printf 'server {\n\
  listen 80;\n\
  root /usr/share/nginx/html;\n\
  index welcome.html;\n\
  location / {\n\
    try_files $uri $uri/ /welcome.html;\n\
  }\n\
}\n' > /etc/nginx/conf.d/default.conf

EXPOSE 80
