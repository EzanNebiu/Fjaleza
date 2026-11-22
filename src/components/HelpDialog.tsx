import { Tile } from './Board';
import { Dialog } from './Dialog';
import type { TileState } from '../game/types';

function Example({ word, mark, state }: { word: string; mark: number; state: TileState }) {
  return (
    <div className="row" role="group" aria-label={`Shembull: ${word}`}>
      {[...word].map((ch, i) => (
        <Tile key={i} letter={ch} state={i === mark ? state : undefined} />
      ))}
    </div>
  );
}

export function HelpDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  return (
    <Dialog open={open} onClose={onClose} title="Si të luash">
      <section>
        <p>
          Gjej fjalën e fshehur në <strong>6 përpjekje</strong>. Çdo përpjekje duhet të jetë një fjalë e vërtetë shqipe
          me <strong>5 shkronja</strong>. Pas çdo përpjekjeje, ngjyrat tregojnë sa afër je.
        </p>
      </section>

      <section className="example">
        <h3>Shembuj</h3>
        <Example word="drita" mark={0} state="correct" />
        <p className="small">
          <strong>D</strong> është në fjalë dhe në vendin e duhur.
        </p>
        <Example word="lumin" mark={1} state="present" />
        <p className="small">
          <strong>U</strong> është në fjalë, por në një vend tjetër.
        </p>
        <Example word="zemër" mark={4} state="absent" />
        <p className="small">
          <strong>R</strong> nuk është në fjalë.
        </p>
      </section>

      <section>
        <h3>Shkronjat Ë dhe Ç</h3>
        <p className="small">
          <span className="letter-list">Ë</span> dhe <span className="letter-list">Ç</span> janë shkronja më vete:{' '}
          <span className="letter-list">E</span> nuk pranohet në vend të <span className="letter-list">Ë</span>.
          Shkronjat dyshe si <span className="letter-list">SH, GJ, DH, LL, NJ, RR, TH, XH, ZH</span> zënë dy kuti,
          një për çdo shkronjë, p.sh. <span className="letter-list">SHAKA</span> = S-H-A-K-A.
        </p>
      </section>

      <section>
        <h3>Fjala e ditës dhe praktika</h3>
        <p className="small">
          Çdo ditë ka një fjalë të re, e njëjtë për të gjithë, që ndërrohet në mesnatë sipas orës tënde. Me butonin e
          praktikës mund të luash sa herë të duash, pa ndikuar në statistika.
        </p>
      </section>

      <section>
        <h3>Modaliteti i vështirë</h3>
        <p className="small">
          Çdo shkronjë e gjelbër duhet të mbetet në vend dhe çdo shkronjë e verdhë duhet të përdoret sërish në
          përpjekjet e mëvonshme.
        </p>
      </section>
    </Dialog>
  );
}
