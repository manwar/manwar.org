#!/usr/bin/env perl

use strict;
use warnings;
use FindBin;
use lib "$FindBin::Bin/../lib";
use manwar;

my $start_inc = { %INC };

END {
    my @m;
    foreach my $m (keys %INC) {
        push @m, $m unless exists $start_inc->{$m};
    }

    if (@m) {
        # STDERR goes to the error_log
        print STDERR "The following modules need to be preloaded:\n";
        print STDERR "$_\n" for @m;
    }
}

manwar->to_app;
