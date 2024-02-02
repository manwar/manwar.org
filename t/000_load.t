#!/usr/bin/env perl

use Test::More tests => 1;

BEGIN { use_ok( 'manwar' ) || print "Bail out!"; }
diag( "Testing Dancer app manwar $manwar::VERSION, Perl $], $^X" );
