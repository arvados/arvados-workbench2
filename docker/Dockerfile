# Copyright (C) The Arvados Authors. All rights reserved.
#
# SPDX-License-Identifier: AGPL-3.0

FROM node:8-buster
MAINTAINER Ward Vandewege <ward@curoverse.com>
RUN apt-get update && \
    apt-get -yq --no-install-recommends -o Acquire::Retries=6 install \
    libsecret-1-0 libsecret-1-dev rpm ruby ruby-dev rubygems build-essential \
    golang libpam0g-dev && \
    apt-get clean
RUN gem install --no-ri --no-rdoc fpm
RUN git clone https://git.arvados.org/arvados.git && cd arvados && \
    go mod download && \
    go run ./cmd/arvados-server install -type test && cd .. && \
    rm -rf arvados && \
    apt-get clean