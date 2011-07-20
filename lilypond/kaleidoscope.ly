%{
KALEIDOSCOPE
%}

\header{
  title = "kaleidoscope"
}

trombone = 
\relative c {
  \set fontSize = #-1
  \clef bass
  
  \time 2/4 e4\f b'
  \time 3/4 d e c
  \time 4/4 r bes2\mf r4
  \time 3/4 r bes d
  \time 5/4 c,8\p[ des c a des c c a gis a]
  g'\<[ g g] r g[ g aes aes ees ees]
  \time 2/4 g4\f des'
  \time 3/4 f g e
  \time 4/4 r dis\p r\> dis8 dis
  \time 5/4 dis[ fis dis] r fis[ dis fis] dis[ g dis]
  \time 9/8 r g[ ees g ees g ees g ees\pp]
  \time 2/4 c,2\mf
  \time 4/4 aes' des
  f bes,
  \time 6/4 r2. ges8\mp[ aes ges e d cis\<]
  \time 4/4 g'[ a g f e d c b]
  \time 3/4 r4\f e4 b' 
  d f a
  \time 2/4 ees,8\p[ ees ees ees]
  \time 4/4 c\<[ ees ees ees c ees c ees]
  ees[ ees ees ees c ees c ees]
  ges[ ees c ees ges ees ges ees]
  ges\<[ bes bes ges bes ges bes des]
  \time 6/4 f4-- e-- g-- e-- gis--\f d--
  \time 1/4 r
}

bassclarinet = 
\relative c, {
  \set fontSize = #-1
  \clef bass

  \time 2/4 fis2~
  \time 3/4 fis2.
  \time 4/4 r4 f des' e
  \time 3/4 g e r
  \time 5/4 c'4. g' a bes8
  d,4. d d c8
  \time 2/4 e,[ e e e]
  \time 3/4 d[ d d] cis[ cis cis]
  \time 4/4 r4 a e' g
  \time 5/4 bes f bes,8[ ges bes b f b] 
  \time 9/8 r des[ ces des ces des ces des ces]
  \time 2/4 r4 g~
  \time 4/4 g1
  r4 c\p g' d'
  \time 6/4 b fis cis c' c c
  \time 4/4 des,, des des des
  \time 3/4 r d8[ g c f] 
  bes[ ees ees aes] aes[ ees]
  \time 2/4 c,[ c c c]
  \time 4/4 g[ c c c g c ees, g]
  g[ g c g c g g c]
  a[ d d a e' b b e]
  ees2 bes'
  \time 6/4 des ees c
  \time 1/4 r4
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