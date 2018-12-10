# Args for FROM directives
ARG UBUNTU_VER=latest

#
# ---- Base Node image ----
FROM ubuntu:${UBUNTU_VER} AS base
ARG NODE_VER=10
ARG GOLANG_VER=1.11.2
ARG PRIVATE_SSH_KEY
ARG MATTERMOST_SERVER_REPO

# expose mm-server port
EXPOSE 8065

# install ssh and git
RUN apt-get update \
&& apt-get install -y --no-install-recommends \
ca-certificates  \
git-core \
ssh

# Copy setup files to the image
COPY bashrc run.sh riffmm-setup.sh /setupfiles/

# run the setup script
RUN chmod +x /setupfiles/*.sh
RUN chown -R 1000 /setupfiles
RUN /setupfiles/riffmm-setup.sh



RUN mkdir -p $HOME/go/src/github.com/mattermost
WORKDIR $HOME/go/src/github.com/mattermost
RUN chown -R 1000 /home/mmuser/

# create and set working directory owned by non-root user; set that user
USER mmuser

WORKDIR /home/mmuser/go/src/github.com/mattermost
RUN git clone --single-branch -b develop $MATTERMOST_SERVER_REPO

# set the GOPATH and the PATH to find the go executables
ENV GOPATH /home/mmuser/go
ENV PATH $GOPATH/bin:/usr/local/go/bin:$PATH


#
# ---- Development ----
FROM base AS development
LABEL Description="dev: This image runs the mattermost-server and webpack watch of mattermost-webapp"

# This is the development image, set NODE_ENV to reflect that
ENV NODE_ENV=development

# expose port that the mattermost server listens to
EXPOSE 8065

# when a container is started w/ this image the mattermost-webapp repository working
# directory must be bound at /home/mmuser/go/src/github.com/mattermost/mattermost-webapp
# and all dependent packages installed AND the mattermost-server repository working
# directory must be bound at /home/mmuser/go/src/github.com/mattermost/mattermost-server
# for this command to correctly start the mattermost-webapp
RUN mkdir -p /home/mmuser/go/src/github.com/mattermost/mattermost-webapp
WORKDIR /home/mmuser/go/src/github.com/mattermost/mattermost-webapp

COPY --chown=1000:1000 . ./

# USER root
# RUN chown -R 1000 /home/mmuser/go/src/github.com/mattermost
# USER mmuser

WORKDIR /home/mmuser/go/src/github.com/mattermost/mattermost-server

RUN chmod +x ../mattermost-webapp/run.sh

RUN echo $MM_SQLSETTINGS_DATASOURCE

CMD ["../mattermost-webapp/run.sh"]

#CMD ["make", "run-in-container"]
