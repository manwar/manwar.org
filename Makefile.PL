
use 5.006;
use strict; use warnings;
use ExtUtils::MakeMaker;

WriteMakefile(
    NAME               => 'manwar',
    AUTHOR             => q{Mohammad S Anwar <mohammad.anwar@yahoo.com>},
    VERSION_FROM       => 'lib/manwar.pm',
    ABSTRACT           => 'lib/manwar.pm',
    LICENSE            => 'artistic_2',
    PL_FILES           => {},
    dist               => { COMPRESS => 'gzip -9f', SUFFIX => 'gz', },
    clean              => { FILES => 'www-manwar-org-*' },
    CONFIGURE_REQUIRES => {
        'ExtUtils::MakeMaker' => 0,
    },
    BUILD_REQUIRES => {
        'Test::More'            => 0,
        'Plack::Test'           => 0,
        'HTTP::Request::Common' => 0,
    },
    PREREQ_PM => {
        'YAML'      => 0,
        'Try::Tiny' => 0,
        'Dancer2'   => 0.159001,
        'Dancer2::Plugin::Ajax'       => 0,
        'Dancer2::Plugin::Chain'      => 0,
        'DBIx::Class::Schema::Loader' => 0,
        'Dancer2::Session::Simple'    => 0,
    },
);
