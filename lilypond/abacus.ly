%{
ABACUS
%}

\header{
  title = "abacus in c"
}

trombone = 
\relative c {
  \clef bass
  \time 5/4

  c4\mp\< g'2 d4 a'
  b2 cis4\mf a cis
  e1\p\< f4\mf
  fis,\p\< g fis e fis
  gis a gis fis gis
  r\mf e'8 f g4 e g\p\<
  f, g e e8[ e e b'\mf]
  r4 c\p\> c c c
  c des c c b
  r\pp\< bes bes bes bes
  bes b bes a g\mf
  r aes\mp\< aes a aes 
  bes c r cis cis
  \time 4/4 cis8\mf d cis4\< cis e
  \time 5/4 r\f fis8[ fis fis fis fis fis] g4
  r fis g a g
  e,\mp e e f e
  r e f g f\<
  r ais8[ ais ais ais] b4 ais
  \time 3/4 r\f gis8[ a b cis]
  \time 4/4 d4 ees e fis
  \time 5/4 r\mp cis8[ cis cis cis cis cis] d4
  cis r cis8\<[ cis cis cis] d4
  \time 3/4 r cis8 cis e4
  \time 4/4 r2\f f--
  \time 5/4 r4 f-- r f-- f--
}

bassclarinet = 
\relative c {
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
  r2 des--
  r4 des-- r d-- d--
}

trombonecolor     = #(rgb-color 0.8 0.8 0.2)
bassclarinetcolor = #(rgb-color 0.7 0.5 0.3)
timecolor         = #(rgb-color 0.7 0.5 0.3)
accidentalcolor   = #(rgb-color 0.1 0.3 0.9)
staffcolor        = #(rgb-color 0.5 0.5 0.5)
clefcolor         = #(rgb-color 0.4 0.4 0.4)
dynamicscolor     = #(rgb-color 0.2 0.7 0.5)

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
