#!/usr/bin/env perl

use strict; use warnings;
use FindBin;
use lib "$FindBin::Bin/../lib";
use Map::Tube::Server;
use Plack::Builder;

builder { mount '/map-tube/v1' => Map::Tube::Server->to_app; };
