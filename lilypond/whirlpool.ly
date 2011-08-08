%{
WHIRLPOOL
%}

\header{
  title = "whirlpool"
}

trombonecolor     = #(rgb-color 0.2 0.2 0.8)
bassclarinetcolor = #(rgb-color 0.7 0.5 0.3)
timecolor         = #(rgb-color 0.6 0.6 0.6)
accidentalcolor   = #(rgb-color 0.4 0.2 0.5)
staffcolor        = #(rgb-color 0.7 0.7 0.9)
clefcolor         = #(rgb-color 0.8 0.2 0.2)
dynamicscolor     = #(rgb-color 0.1 0.5 0.5)

turnnotecolor     = #(rgb-color 0.3 0.3 0.8)
slurnotecolor     = #(rgb-color 0.9 0.3 0.2)
turndotcolor      = #(rgb-color 0.7 0.6 0.1)
flownotecolor     = #(rgb-color 0.1 0.6 0.7)
emphasiscolor     = #(rgb-color 0.7 0.3 0.1)

trombone = 
\relative c' {
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
  \override NoteHead #'color = #turnnotecolor
  \override Stem #'color = #turnnotecolor
  \override Beam #'color = #turnnotecolor
  \override Accidental #'color = #turndotcolor
  e,8[ e e e cis cis e e f f cis cis cis cis]
  e[ e e e e e f f cis cis cis cis e e]
  \override NoteHead #'color = #slurnotecolor
  \override Stem #'color = #slurnotecolor
  \override Beam #'color = #slurnotecolor
  \override Accidental #'color = #accidentalcolor
  bes'4\mf--\glissando d aes b--\glissando ees b cis 
  d--\glissando aes aes aes--\glissando e e--\glissando c
  \override NoteHead #'color = #flownotecolor
  \override Stem #'color = #flownotecolor
  \override Beam #'color = #flownotecolor
  gis'8\mp[ gis g g g g g g e e e e dis dis]
  dis\>[ dis dis dis d d d d d d b b b b]
  b[ b b b a' b, b b a' a b, a' bes a]
  b,\<[ b bes' bes bes bes b, bes'\mp] r2.
}

bassclarinet = 
\relative c {
  \time 7/4
  \clef bass
  r1 r2.
  e4 e des des b'8[ b b b bes bes]
  c,4 c d des b8[ b b b c c]
  r4 g' e c aes2.
  g1 % ~ 
  \override NoteHead #'color = #slurnotecolor
  \override Stem #'color = #slurnotecolor
  \override Beam #'color = #slurnotecolor
    cis8[ cis cis cis cis cis]
  \revert NoteHead #'color
  \revert Stem #'color
  \revert Beam #'color
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
  \override NoteHead #'color = #turnnotecolor
  \override Stem #'color = #turnnotecolor
  \override Beam #'color = #turnnotecolor
  \override Accidental #'color = #turndotcolor
  g'8[ g g g e e gis gis gis gis e e gis gis]
  gis[ gis gis gis a a dis, dis ais' ais ais ais e e]
  cis[ cis cis cis] fis[ fis ges ges ges ges ges ges ges ges]
  gis[ gis gis gis gis gis fis fis gis gis fis fis fis fis]
  fis[ fis d' d d d d d d d dis dis c c]
  \override NoteHead #'color = #slurnotecolor
  \override Stem #'color = #slurnotecolor
  \override Beam #'color = #slurnotecolor
  \override Accidental #'color = #accidentalcolor
  f,,4 e' f, ges' f, e' ges
  c, b' d, b' d f b,
  \revert NoteHead #'color
  \revert Stem #'color
  \revert Beam #'color
  \revert Accidental #'color
  f, f c'2 f,4 c' c
  c e,1 f2
  f2. f4 f e'2
  e2. fis4 r2.
}

\score {
  << 
  \new Staff {
    \set Staff.instrumentName = #"trombone"
    \override Staff.InstrumentName #'color = #trombonecolor
    \override Staff.TimeSignature #'color = #timecolor
    \override Staff.TimeSignature #'style = #'numbered
    \override Staff.TimeSignature #'font-size = #-1
    \override Staff.Accidental #'color = #accidentalcolor
    \override Staff.Rest #'color = #accidentalcolor
    \override Staff.Dots #'color = #accidentalcolor
    \override Staff.StaffSymbol #'color = #staffcolor
    \override Staff.LedgerLineSpanner #'color = #staffcolor
    \override Staff.BarLine #'color = #clefcolor
    \override Staff.Clef #'color = #clefcolor
    \override Staff.DynamicText #'color = #dynamicscolor
    \override Staff.Hairpin #'color = #dynamicscolor
    \new Voice {
      \trombone
    }
  }
  \new Staff {
    \set Staff.instrumentName = #"bass clarinet"
    \override Staff.InstrumentName #'color = #bassclarinetcolor
    \override Staff.TimeSignature #'color = #timecolor
    \override Staff.TimeSignature #'style = #'numbered
    \override Staff.TimeSignature #'font-size = #-1
    \override Staff.Accidental #'color = #accidentalcolor
    \override Staff.Rest #'color = #accidentalcolor
    \override Staff.Dots #'color = #accidentalcolor
    \override Staff.StaffSymbol #'color = #staffcolor
    \override Staff.LedgerLineSpanner #'color = #staffcolor
    \override Staff.BarLine #'color = #clefcolor
    \override Staff.Clef #'color = #clefcolor
    \override Staff.DynamicText #'color = #dynamicscolor
    \override Staff.Hairpin #'color = #dynamicscolor
    \new Voice {
      \bassclarinet
    }
  }
  >>
}

\version "2.14.1"
