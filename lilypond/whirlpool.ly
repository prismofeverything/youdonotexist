%{
WHIRLPOOL
%}

\header{
  title = "whirlpool"
}

trombone = 
\relative c' {
  \set fontSize = #-1
  \time 7/4
  \clef bass
  aes4.\mf aes8 f4. f8 d4 c d
  aes'4. aes8 f4.\< f8 d'4 c d
  bes4.\p bes8 aes4. aes8 ees'4\< des d
  bes4.\< bes8 aes4.\mf aes8 g'4\> e c
  b4.\p b8 e,4. e8 b'4 a b
  b4. b8 e,4. e8 b'4\< bes c
  des4.\< des8 g,4. g8 des'4 c d
  e2\mf e e e4
  f,8\p[ f f f f d d d d f f] fis4.
  fis8 fis fis4. fis4. fis8[ fis fis fis g g]
  c,2. e\< c4
  e2.\p g2\< e2
  aes8\mf[ c aes c aes c aes c aes c] d4 d
  a,1\p g'2 b,4
  bes'8\<[ a c bes bes a c b b a] des[ c c a]
  des\<[ c c a] e'4 e f des g, 
  f'1\p fis2 dis4
  ais' ais e c' cis g g
  e gis dis2 dis4 dis d
  e,8[ e e e cis cis e e f f cis cis cis cis]
  e[ e e e e e f f cis cis cis cis e e]
  bes'4\mf--\glissando d aes b--\glissando ees b cis 
  d--\glissando aes aes aes--\glissando e e--\glissando c
  gis'8\mp[ gis g g g g g g e e e e dis dis]
  dis\>[ dis dis dis d d d d d d b b b b]
  b[ b b b a' b, b b a' a b, a' bes a]
  b,\<[ b bes' bes bes bes b, bes'\mp] r2.
}

bassclarinet = 
\relative c {
  \set fontSize = #-1
  \time 7/4
  \clef bass
  r1 r2.
  e4 e des des b'8[ b b b bes bes]
  c,4 c d des b8[ b b b c c]
  r4 g' e c aes2.
  g1 cis8[ cis cis cis cis cis]
  f,2. f4 d'8[ d d d] d4
  g, f' a, bes' b,8[ b b a a a]
  cis4 cis cis d d d dis
  c' e2 c4 ees c d 
  ees2 ees b f'4
  ges,8[ ees ges ees ges g] aes[ f aes f aes a] aes e
  g[ e g e g e] b'[ f b c] d[ b dis b]
  g'4. des8[ e ees] ees4 d b8[ c c cis]
  c,[ e e g c, g' e g] bes[ g g bes d c]
  d2 f4 g d gis2
  a,,4 f des d c'2 cis4
  g'8[ g g g e e gis gis gis gis e e gis gis]
  gis[ gis gis gis a a dis, dis ais' ais ais ais e e]
  cis[ cis cis cis] fis[ fis ges ges ges ges ges ges ges ges]
  gis[ gis gis gis gis gis fis fis gis gis fis fis fis fis]
  fis[ fis d' d d d d d d d dis dis c c]
  f,,4 e' f, ges' f, e' ges
  c, b' d, b' d f b,
  f, f c'2 f,4 c' c
  c e,1 f2
  f2. f4 f e'2
  e2. fis4 r2.
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
