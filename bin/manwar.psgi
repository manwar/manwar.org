#!/usr/bin/env perl

use strict; use warnings;
use FindBin;
use lib "$FindBin::Bin/../lib";
use manwar;
use Plack::Builder;

builder { mount '/' => manwar->to_app; };
