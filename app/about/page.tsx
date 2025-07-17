'use client';

import React from 'react';

function AboutUsSection() {
  return (
    <section className="py-10 px-10 bg-gray-100">
      <h2 className="text-2xl font-semibold mb-4">About Us Section</h2>
      <p>Somos un equipo formado por arquitectxs y diseñadorxs interdisciplinarios encargadxs de hacer tangibles las ideas.</p>
    </section>
  );
}

function TeamSection() {
  return (
    <section className="py-10 px-10 bg-gray-200">
      <h2 className="text-2xl font-semibold mb-4">Team Section</h2>
      <p>Conoce a nuestro equipo de profesionales que trabaja para vos.</p>
    </section>
  );
}

export default function Page() {
  return (
    <div className="bg-white flex justify-center w-full">
      <div className="w-full max-w-[1440px] relative">
        {/* Main Content */}
        <main className="mt-24 px-10">
          {/* Hero Section */}
          <section className="flex flex-row w-full relative py-10 gap-8">
            <div className="w-1/2">
              <img
                className="w-full h-auto max-h-[600px] object-cover"
                alt="Team photo"
                src=""
              />
            </div>
            <div className="w-1/2 flex flex-col justify-between">
              <div>
                <h1 className="font-light text-gray-800 text-[32px] mb-4 font-sans">
                  Construimos imaginarios colectivos
                </h1>
                <p className="font-normal text-black text-sm max-w-[442px] leading-relaxed font-serif">
                  WHAT IF es el resultado de 7 años de trabajo enfocado en construir arquitecturas / situaciones urbanas que mejoren la ciudad, así como comunicar estrategias socioculturales que lo posibilitan. Trabajamos para construir imaginarios colectivos que conforman nuestro cotidiano.
                  <br />
                  <br />
                  Nuestro trabajo transita entre la obra construida permanente (vivienda, oficina, espacio público) y la arquitectura temporal (eventos, stands, set design).
                  <br />
                  <br />
                  Hemos trabajado para el Gobierno de España, Ayuntamiento de Madrid o la Generalitat Valenciana; entidades culturales como Veranos de la Villa, Matadero Madrid o Conde Duque; agencias como Grupo PRISA, Venue Brand Experience o LaBoutique77; y marcas como Möet &amp; Chandon, L&#39;Oréal, CocaCola, etc.
                  <br />
                  Nuestro trabajo se ha mostrado en la Bienal de Venecia o das spanische Kulturinstitut de Berlín; así como en diferentes medios de comunicación como El País, La Sexta o la cadena SER, entre otros.
                  <br />
                  <br />
                  Impartimos docencia en la Universidad Politécnica de Madrid, el Instituto Europeo de Diseño (IED) y en la Universidad Nebrija.
                </p>
              </div>
              <h2 className="font-light text-gray-800 text-[32px] text-right font-sans">
                que configuran nuestro cotidiano.
              </h2>
            </div>
          </section>

          {/* About Us Section */}
          <section className="flex flex-row w-full relative py-10 gap-8">
            <div className="w-1/2">
              <p className="text-gray-700 text-sm max-w-[441px] font-serif">
                Somos un equipo formado por arquitectxs y diseñadorxs interdisciplinarios encargadxs de hacer tangibles las ideas.
              </p>
              <div className="mt-8 w-[324px] h-[486px] bg-gray-300"></div>
            </div>
            <div className="w-1/2 flex flex-col items-end">
              <h2 className="font-light text-gray-800 text-[32px] text-right font-sans">
                ¿Quiénes somos?
              </h2>
              <div className="mt-8 w-[324px] h-[486px] bg-gray-400"></div>
            </div>
          </section>

          {/* Project Gallery Section */}
          <section className="grid grid-cols-3 gap-4 py-10">
            {[1, 2, 3, 4, 5, 6].map((index) => (
              <div key={`project-${index}`} className="w-[324px] h-[486px] bg-gray-300 rounded shadow"></div>
            ))}
          </section>

          {/* Team Sections */}
          <AboutUsSection />
          <TeamSection />

          {/* Former Team Members Section */}
          <section className="flex justify-end py-10 px-10">
            <h2 className="font-light text-gray-800 text-[32px] text-right font-sans">
              Former team members
            </h2>
          </section>

          {/* Dossier Button */}
          <section className="flex justify-center py-10">
            <button
              className="flex items-center gap-2.5 px-4 py-1 border border-black text-black font-serif hover:bg-black hover:text-white transition-colors rounded"
              type="button"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="w-4 h-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 12v8m0-8V4m0 0L8 8m4-4l4 4"
                />
              </svg>
              <span className="text-lg font-normal">Our Dossier</span>
            </button>
          </section>
        </main>
      </div>
    </div>
  );
}
