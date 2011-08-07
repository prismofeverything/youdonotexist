%{
CREATURE
%}

\header{
  title = "CREATURE"
}

trombone = 
\relative c' {
  \clef bass
  \time 2/4

  r2\p
  r
  r
  r4 bes
  bes2~
  bes4 ees,
  bes' ces
  \time 3/8 a4.
  \time 2/4 a4 gis
  \time 6/8 gis4. g
  \time 5/8 f'2 c8
  \time 6/8 c des c f,4 c'8
  \time 5/8 f, ges'2
  \time 6/8 g4\< g gis
  \time 5/8 a,2\mf fis8
  \time 6/8 c\p[ ees g c, ees g]
  \time 5/8 c,[ d f c d]
  \time 7/8 f[ ges f c f c f]
  \time 6/8 e[ b e b e b]
  \time 7/8 fis''\mp[ d b a fis a b]
  \time 8/8 g'\<[ ees] fis[ d b g b d]
  \time 7/8 ees2 f4.
  \time 12/8 g1.\f\>
  \time 2/4 r2\p
  r
  r4 g,
  gis2\mp
  bes
  c4 d8[ e]
  \time 5/8 f4.\< c8[ g]
  fis'4 g,8[ g gis]
  bes[ aes g] g4
  e a8[ g d]
  g[ d bes'] ees4
  f\mf\> c g8~
  g e4 a
  b8\mp\<[ dis b dis b]
  \time 7/8 b,[ d fis fis c fis c]
  \time 4/4 a1
  \time 6/8 b8[ ees g] ees[ g ees]
  ais2.
  \time 9/8 b8-^\mf\<[ b-^ b-^ b-^ b-^] b[ b b b]
  b-^[ b-^ b-^ b-^ b-^] b[ b b b]
  b-^[ b-^ b-^ b-^ b-^] b[ b b b]
  b-^[ b-^ b-^ b-^ b-^] b[ b b b]
  b-^[ b-^ b-^ b-^ b-^] b[ b b b]
  \time 2/4 a,16\p\<[ b cis] dis[ e f a c]
  \time 5/8 e4\f e4.
}

bassclarinet = 
\relative c {
  \clef bass
  \time 2/4

  c8[ ees g c]
  c,[ ees g c]
  c,[ ees g des']
  c,[ ees g des']
  c,[ ees aes c]
  c,[ ees aes d]
  c,[ ees aes ees']
  c,[ e bes']
  c,[ e b' e,]
  dis[ gis b] b[ e, b']
  e,,[ g e' g, e']
  ees,[ g c ees g c]
  ees4 des c8
  c[ b a c bes a]
  gis-^[ gis-^ gis-^ gis-^ gis-^]
  f'2 c4
  e2 ees8
  g2 des4 f8
  a2 bes4
  a,,8[ c e g e c a]
  fis[ a c a c e g e]
  bes'[ g e c a fis d]
  c''[ a f des a f des f des f des f]
  a[ c e a]
  a,[ c e a]
  a,[ c e bes']
  a,[ cis f bes]
  a,[ cis f bes]
  a,[ d f bes]
  a,[ ees' a ees a,]
  a[ ees' a ees a,]
  a[ e' a e a,]
  a[ f' b f a,]
  aes[ f' c' f, aes,]
  g[ b d ees f]
  fis[ cis fis fis cis]
  fis[ c fis fis c]
  g''2. d8
  gis4 e cis bis
  a'2~ a8 d,
  ais'4 f d
  cis,8-^[ cis-^ cis-^ cis-^ cis-^] c[ c c c]
  cis8-^[ cis-^ cis-^ cis-^ cis-^] c[ c c c]
  e4 b fis' a e8~
  e c'1
  des8[ c des ees b] f'4 fis
  cis16[ a fis] c[ a b c d]
  d'4 d8[ cis ees]
}

<< 
  \new Staff \trombone {

  }
  \new Staff \bassclarinet {

  }
>>

\version "2.14.1"
