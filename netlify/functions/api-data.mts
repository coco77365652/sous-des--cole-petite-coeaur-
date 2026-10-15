import type { Config } from "@netlify/functions";
import { getDatabase } from "@netlify/database";

const DEFAULT_SITE_DATA = {
  adminPassword: "admin123",
  general: {
    assocName: "Sou des Écoles de Petit-Cœur",
    assocSub: "Petit-Cœur • La Léchère",
    heroTitle: "Ensemble pour les enfants de Petit-Cœur !",
    heroDesc: "Association de parents bénévoles dédiée au financement des sorties scolaires, projets pédagogiques, équipements et animations des écoles de notre village.",
    bureauText: "« Chaque événement organisé est une opportunité de financer un voyage, des sorties de ski, du matériel informatique ou des spectacles pour nos enfants. Merci à toute l'équipe enseignante, aux bénévoles et aux familles de la commune pour leur engagement ! »",
    locationTag: "Savoie - Commune de La Léchère",
    statEleves: "120+",
    statEvents: "6",
    statBudget: "4 500 €"
  },
  budget: {
    current: 3800,
    target: 5000
  },
  upcomingEvents: [
    {
      id: 1,
      title: "Grande Vente de Gâteaux",
      date: "12 NOVEMBRE 2026",
      badge: "Gourmandise",
      time: "16h30 - 18h00",
      location: "Cour de l'École de Petit-Cœur",
      desc: "À la sortie des classes. Les bénéfices serviront à financer le spectacle de marionnettes de Noël."
    },
    {
      id: 2,
      title: "Vente de Sapins & Marché de Noël",
      date: "04 DÉCEMBRE 2026",
      badge: "Noël",
      time: "17h00 - 20h00",
      location: "Salle polyvalente de La Léchère",
      desc: "Commandez votre sapin Nordmann local et découvrez les créations artisanales des enfants."
    },
    {
      id: 3,
      title: "Grand Loto du Sou des Écoles",
      date: "31 JANVIER 2027",
      badge: "Loto annuel",
      time: "Début des tirages à 14h00",
      location: "Salle des Fêtes, Petit-Cœur",
      desc: "De nombreux lots à gagner ! Buvette, crêpes et tombola spéciale enfants."
    }
  ],
  pastEvents: [
    {
      id: 101,
      title: "Carnaval des Écoliers",
      date: "Mars 2026",
      desc: "Défilé déguisé des écoliers dans le village de Petit-Cœur suivi d'un grand goûter offert par le Sou.",
      photos: [
        "https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=600&q=80",
        "https://images.unsplash.com/photo-1513151233558-d860c5398176?auto=format&fit=crop&w=600&q=80"
      ]
    },
    {
      id: 102,
      title: "Kermesse de Fin d'Année",
      date: "Juin 2025",
      desc: "Une superbe journée ensoleillée avec stands de jeux, chamboule-tout, buvette et spectacle de danse.",
      photos: [
        "https://images.unsplash.com/photo-1567057419565-4349c49d8a04?auto=format&fit=crop&w=600&q=80",
        "https://images.unsplash.com/photo-1516627145497-ae6968895b74?auto=format&fit=crop&w=600&q=80"
      ]
    }
  ],
  projects: [
    {
      id: 201,
      title: "Cycle Ski de Fond à Naves",
      category: "Sport & Montagne",
      status: "Financé à 100%",
      desc: "Financement du matériel et du transport pour 5 séances d'apprentissage sur le plateau nordique."
    },
    {
      id: 202,
      title: "Classe Découverte Nature (3 jours)",
      category: "Voyage Pédagogique",
      status: "En cours (65%)",
      desc: "Séjour au Lac d'Annecy pour la classe de CM1/CM2 (hébergement & ateliers faune/flore)."
    }
  ]
};

export default async (req: Request) => {
  const headers = {
    "Content-Type": "application/json",
    "Cache-Control": "no-store, no-cache, must-revalidate",
  };

  try {
    const db = getDatabase();

    if (req.method === "GET") {
      const rows = (await db.sql`
        SELECT data FROM site_settings WHERE key = 'main' LIMIT 1
      `) as Array<{ data: any }>;

      if (rows && rows.length > 0 && rows[0].data) {
        return new Response(JSON.stringify(rows[0].data), { headers, status: 200 });
      }

      // If no row exists, initialize with default data
      await db.sql`
        INSERT INTO site_settings (key, data, updated_at)
        VALUES ('main', ${JSON.stringify(DEFAULT_SITE_DATA)}::jsonb, NOW())
        ON CONFLICT (key) DO NOTHING
      `;

      return new Response(JSON.stringify(DEFAULT_SITE_DATA), { headers, status: 200 });
    }

    if (req.method === "POST") {
      const body = await req.json();
      if (!body || typeof body !== "object") {
        return new Response(JSON.stringify({ error: "Invalid JSON body" }), {
          headers,
          status: 400,
        });
      }

      const jsonStr = JSON.stringify(body);
      await db.sql`
        INSERT INTO site_settings (key, data, updated_at)
        VALUES ('main', ${jsonStr}::jsonb, NOW())
        ON CONFLICT (key)
        DO UPDATE SET data = EXCLUDED.data, updated_at = NOW()
      `;

      return new Response(JSON.stringify({ success: true, data: body }), {
        headers,
        status: 200,
      });
    }

    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      headers,
      status: 405,
    });
  } catch (error: any) {
    console.error("API error in /api/data:", error);
    if (req.method === "GET") {
      return new Response(JSON.stringify(DEFAULT_SITE_DATA), { headers, status: 200 });
    }
    return new Response(JSON.stringify({ error: error.message || "Internal server error" }), {
      headers,
      status: 500,
    });
  }
};

export const config: Config = {
  path: "/api/data",
};
