import { Hero } from '../inicio/Hero'
import { LojaInicio } from '../inicio/LojaInicio'
import { Faixas, Linhas } from '../inicio/Linhas'
import { Vitrine } from '../inicio/Vitrine'
import { Manifesto } from '../inicio/Manifesto'
import { CenaVisor } from '../inicio/CenaVisor'
import { Oficina } from '../inicio/Oficina'
import { CatalogoChamada, Passos } from '../inicio/ComoComprar'
import { Duvidas, Orcamento } from '../inicio/Orcamento'

export default function Inicio({ pronto }: { pronto: boolean }) {
  return <>
    <Hero pronto={pronto} />
    <LojaInicio />
    <Faixas />
    <Linhas />
    <Vitrine texto="As conexões que mais saem, prontas para escolher medida e aço. Arraste para o lado ou use as setas." />
    <Manifesto />
    <CenaVisor />
    <Oficina />
    <Passos />
    <CatalogoChamada />
    <Orcamento />
    <Duvidas />
  </>
}
