%{
ABACUS
%}

\header{
  title = "abacus in c"
}

trombone = 
\relative c {
  \set fontSize = #-1
  \clef bass
  \time 5/4

  c4 g'2 d4 a'
  b2 cis4 a cis
  e1 f4
  fis, g fis e fis
  gis a gis fis gis
  r e'8 f g4 e g
  f, g e e8[ e e b']
  r4 c c c c
  c des c c b
  r bes bes bes bes
  bes b bes a g
  r aes aes a aes 
  bes c r cis cis
  \time 4/4 cis8 d cis4 cis e
  \time 5/4 r fis8[ fis fis fis fis fis] g4
  r fis g a g
  e, e e f e
  r e f g f
  r ais8[ ais ais ais] b4 ais
  \time 3/4 r gis8[ a b cis]
  \time 4/4 d4 ees e fis
  \time 5/4 r cis8[ cis cis cis cis cis] d4
  cis r cis8[ cis cis cis] d4
  \time 3/4 r cis8 cis e4
  \time 4/4 r2 f--
  \time 5/4 r4 f-- r f-- f--
}

bassclarinet = 
\relative c {
  \set fontSize = #-1
  \clef bass
  \time 5/4

  r2 ges4 des' ees
  g2. f2
  e4 c e f a
  b2 g4 b g
  cis2 e fis4
  g1 aes,4
  bes2 aes4 bes aes
  r e e f fis
  g, fis' fis f f
  r d d ees e
  e c e e f
  r ges,8[ aes bes b c des e des]
  e f4 fis8 r4 \times 2/3 {d'8[ e d]} \times 2/3 {f[ d f]}
  fis4 fis8[ fis fis fis] \times 2/3 {fis[ g fis]}
  \times 5/4 {des,,1}
  g2. f'4 a,
  r1 e8 f
  g[ a b c d e] f[ g aes bes]
  gis,[ ais b cis d e] f4 fis
  r ees'8[ d c b]
  a4 aes ges c,
  r fis'8[ fis fis fis g g g gis]
  r a,[ a a] bes[ a a bes bes bes]
  b[ bes bes bes] c4
  r2 des
  r4 des r d d
}

<< 
  \new Staff \trombone {
    \override StaffSymbol #'staff-space = #(magstep -3)
  }
  \new Staff \bassclarinet {
    \override StaffSymbol #'staff-space = #(magstep -3)
  }
>>

\version "2.14.1"
