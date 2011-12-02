%{
CREATURE
%}

\version "2.14.1"
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

  \override NoteHead #'color = #(rgb-color 0.1 0.2 1)
  \override Stem #'color = #(rgb-color 0.1 0.2 1)
  \override Beam #'color = #(rgb-color 0.1 0.2 1)
  \override Accidental #'color = #(rgb-color 0.9 0.2 0.1)
  \override DynamicText #'color = #(rgb-color 0.3 0.7 0.4)
  \override Hairpin #'color = #(rgb-color 0.3 0.7 0.4)

  \time 7/8 fis''\mp[ d b a fis a b]
  \time 8/8 g'\<[ ees] fis[ d b g b d]

  \revert NoteHead #'color
  \revert Stem #'color
  \revert Beam #'color

  \time 7/8 ees2 f4.
  \time 12/8 g1.\f\>

  \revert Accidental #'color
  \revert DynamicText #'color
  \revert Hairpin #'color

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

  \override NoteHead #'color = #(rgb-color 1 0.2 0.1)
  \override Stem #'color = #(rgb-color 1 0.2 0.1)
  \override Beam #'color = #(rgb-color 1 0.2 0.1)
  \override Accidental #'color = #(rgb-color 0.1 0.2 0.9)
  \override Script #'color = #(rgb-color 0.1 0.2 0.9)
  \override DynamicText #'color = #(rgb-color 0.9 0.9 0.5)
  \override Hairpin #'color = #(rgb-color 0.9 0.9 0.5)

  \time 9/8 b8-^\mf\<[ b-^ b-^ b-^ b-^] b[ b b b]
  b-^[ b-^ b-^ b-^ b-^] b[ b b b]
  b-^[ b-^ b-^ b-^ b-^] b[ b b b]
  b-^[ b-^ b-^ b-^ b-^] b[ b b b]
  b-^[ b-^ b-^ b-^ b-^] b[ b b b]

  \revert NoteHead #'color
  \revert Stem #'color
  \revert Beam #'color
  \revert Accidental #'color
  \revert Script #'color
  \revert DynamicText #'color
  \revert Hairpin #'color

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
  \override NoteHead #'color = #(rgb-color 0.1 0.2 1)
  \override Stem #'color = #(rgb-color 0.1 0.2 1)
  \override Beam #'color = #(rgb-color 0.1 0.2 1)
  \override Accidental #'color = #(rgb-color 0.9 0.2 0.1)
  a,,8[ c e g e c a]
  fis[ a c a c e g e]
  bes'[ g e c a fis d]
  c''[ a f des a f des f des f des f]
  \revert NoteHead #'color
  \revert Stem #'color
  \revert Beam #'color
  \revert Accidental #'color
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
  \override NoteHead #'color = #(rgb-color 1 0.2 0.1)
  \override Stem #'color = #(rgb-color 1 0.2 0.1)
  \override Beam #'color = #(rgb-color 1 0.2 0.1)
  \override Accidental #'color = #(rgb-color 0.1 0.2 0.9)
  \override Script #'color = #(rgb-color 0.1 0.2 0.9)
  cis,8-^[ cis-^ cis-^ cis-^ cis-^] c[ c c c]
  cis8-^[ cis-^ cis-^ cis-^ cis-^] c[ c c c]
  \revert NoteHead #'color
  \revert Stem #'color
  \revert Beam #'color
  \revert Accidental #'color
  \revert Script #'color
  e4 b fis' a e8~
  e c'1
  des8[ c des ees b] f'4 fis
  cis16[ a fis] c[ a b c d]
  d'4 d8[ cis ees]
}

\score { 
  <<
  \new Staff {
    \set Staff.instrumentName = #"trombone"
    \override Staff.InstrumentName #'color = #(rgb-color 0.7 0.5 0.3)
    \override Staff.TimeSignature #'color = #(rgb-color 0.4 0.2 0.5)
    \override Staff.TimeSignature #'style = #'numbered
    \override Staff.TimeSignature #'font-size = #-1
    \override Staff.Accidental #'color = #(rgb-color 0.1 0.5 0.3)
    \override Staff.Rest #'color = #(rgb-color 0.1 0.5 0.3)
    \override Staff.StaffSymbol #'color = #(rgb-color 0.5 0.5 0.4)
    \override Staff.LedgerLineSpanner #'color = #(rgb-color 0.7 0.7 0.6)
    \override Staff.BarLine #'color = #(rgb-color 0.5 0.5 0.5)
    \override Staff.Clef #'color = #(rgb-color 0.5 0.5 0.5)
    \override Staff.DynamicText #'color = #(rgb-color 0.3 0.5 0.7)
    \override Staff.Hairpin #'color = #(rgb-color 0.3 0.5 0.7)
    \new Voice {
      \trombone
    }
  }
  \new Staff {
    \set Staff.instrumentName = #"bass clarinet"
    \override Staff.InstrumentName #'color = #(rgb-color 0.5 0.3 0.7)
    \override Staff.TimeSignature #'color = #(rgb-color 0.4 0.2 0.5)
    \override Staff.TimeSignature #'style = #'numbered
    \override Staff.TimeSignature #'font-size = #-1
    \override Staff.Accidental #'color = #(rgb-color 0.1 0.5 0.3)
    \override Staff.Rest #'color = #(rgb-color 0.1 0.5 0.3)
    \override Staff.StaffSymbol #'color = #(rgb-color 0.5 0.5 0.4)
    \override Staff.LedgerLineSpanner #'color = #(rgb-color 0.7 0.7 0.6)
    \override Staff.BarLine #'color = #(rgb-color 0.5 0.5 0.5)
    \override Staff.Clef #'color = #(rgb-color 0.5 0.5 0.5)
    \override Staff.DynamicText #'color = #(rgb-color 0.3 0.5 0.7)
    \override Staff.Hairpin #'color = #(rgb-color 0.3 0.5 0.7)
    \new Voice {
      \bassclarinet
    }
  }
  >>
}


