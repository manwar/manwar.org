#!/usr/bin/env perl

use strict;
use warnings;

use manwar;
use Test::More tests => 2;
use Plack::Test;
use HTTP::Request::Common;

$ENV{MAP_BASE_URL} = 'http://127.0.0.1';

my $app = manwar->to_app;
is( ref $app, 'CODE', 'Got app' );

my $test = Plack::Test->create($app);
my $res  = $test->request( GET '/' );

ok( $res->is_success, '[GET /] successful' );
