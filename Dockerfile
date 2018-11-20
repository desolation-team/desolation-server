FROM node:10.13-alpine
RUN mkdir /app
WORKDIR /app
COPY package.json /app/
RUN npm install
MAINTAINER desolation-team <desolation.project.team@gmail.com>
COPY src /app/src
ENV PORT="172.17.0.4"
ENV PORT=4000
EXPOSE 4000
CMD [ "npm", "start" ]
