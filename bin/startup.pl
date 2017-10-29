#!/usr/bin/env perl

use strict;
use warnings;

use Apache2::RequestRec ();
use Apache2::RequestIO ();
use Apache2::RequestUtil ();

use Apache2::ServerRec ();
use Apache2::ServerUtil ();
use Apache2::Connection ();
use Apache2::Log ();

use APR::Table ();

use ModPerl::Registry ();

use Apache2::Const -compile => ':common';
use APR::Const -compile => ':common';

BEGIN {
    return unless Apache2::ServerUtil::restart_count() > 1;

    use Template;
    use Dancer2::Core::App;
    use Dancer2::Core::Role::Engine;
    use Dancer2::Core::Role::Logger;
    use URI;
    use Digest::base;
    use Digest::SHA;
    use MIME::Base64;
    use Dancer2::Core::Role::Template;
    use Dancer2::Session::Simple;
    use Dancer2::Logger::Console;
    use Dancer2::Template::TemplateToolkit;
    use Dancer2::Core::Session;
    use Dancer2::Core::Role::SessionFactory;

    require Plack::Handler::Apache2;

    my @psgis = ($ENV{PSGI_APP_PATH});
    foreach my $psgi (@psgis) {
        Plack::Handler::Apache2->preload($psgi);
    }
}

1; # file must return true!
