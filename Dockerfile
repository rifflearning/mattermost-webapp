# Args for FROM directives
ARG UBUNTU_VER=latest

#
# ---- Base Node image ----
FROM ubuntu:${UBUNTU_VER} AS base
ARG NODE_VER=10
ARG GOLANG_VER=1.11.2
ARG MATTERMOST_SERVER_REPO=https://github.com/rifflearning/mattermost-server.git

# Copy setup files to the image
COPY bashrc run.sh riffmm-setup-ci.sh /setupfiles/

# run the setup script
RUN chmod +x /setupfiles/*.sh \
    && /setupfiles/riffmm-setup-ci.sh

# create and set working directory owned by non-root user; set that user
WORKDIR /home/mmuser
USER mmuser

# set the GOPATH and the PATH to find the go executables
ENV GOPATH /home/mmuser/go
ENV PATH $GOPATH/bin:/usr/local/go/bin:$PATH

# Set the default command to run when the container is started
CMD ["./run.sh"]


#
# ---- Continuous Integration/Deployment ----
FROM base AS ci
LABEL Description="ci: This image runs the mattermost-server and webpack watch of mattermost-webapp"

# environment vars needed for the CI configuration
ARG RIFF_SERVER_URL
ARG SIGNALMASTER_URL
ARG MM_SQLSETTINGS_DATASOURCE
ENV RIFF_SERVER_URL=$RIFF_SERVER_URL
ENV SIGNALMASTER_URL=$SIGNALMASTER_URL
ENV MM_SQLSETTINGS_DATASOURCE=$MM_SQLSETTINGS_DATASOURCE

# This is the development image, set NODE_ENV to reflect that
ENV NODE_ENV=development

# expose port that the mattermost server listens to
EXPOSE 8065

# Copy the current file structure from this Dockerfile's mattermost-webapp context into place for
# access by the mattermost-server
COPY --chown=mmuser:mmuser . /home/mmuser/go/src/github.com/mattermost/mattermost-webapp/
RUN cd /home/mmuser/go/src/github.com/mattermost/mattermost-webapp/ \
    && npm install
