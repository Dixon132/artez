"""
Seed script: Populates continents, shipping zones, and ALL countries of the world.
Run: python manage.py shell < seed_countries.py
"""
import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from apps.orders.models import Continent, ShippingZone, Country

Country.objects.all().delete()
ShippingZone.objects.all().delete()
Continent.objects.all().delete()

print("Creating continents and shipping zones...")

CONTINENTS_DATA = {
    'south_america': {
        'name': 'Sudamérica',
        'zones': {
            'south_america_west': {
                'name': 'Sudamérica - Zona Andina',
                'price': 18, 'extra_per_item': 8,
                'countries': [
                    ('Bolivia', 'BO'), ('Colombia', 'CO'), ('Ecuador', 'EC'),
                    ('Perú', 'PE'), ('Venezuela', 'VE'),
                ]
            },
            'south_america_south': {
                'name': 'Sudamérica - Zona Sur',
                'price': 15, 'extra_per_item': 6,
                'countries': [
                    ('Argentina', 'AR'), ('Chile', 'CL'), ('Paraguay', 'PY'),
                    ('Uruguay', 'UY'),
                ]
            },
            'south_america_east': {
                'name': 'Sudamérica - Zona Atlántica',
                'price': 20, 'extra_per_item': 9,
                'countries': [
                    ('Brasil', 'BR'), ('Guyana', 'GY'), ('Surinam', 'SR'),
                    ('Guayana Francesa', 'GF'),
                ]
            },
        }
    },
    'north_america': {
        'name': 'Norteamérica',
        'zones': {
            'north_america_main': {
                'name': 'Norteamérica',
                'price': 25, 'extra_per_item': 10,
                'countries': [
                    ('Estados Unidos', 'US'), ('Canadá', 'CA'), ('México', 'MX'),
                ]
            },
            'central_america': {
                'name': 'Centroamérica',
                'price': 28, 'extra_per_item': 12,
                'countries': [
                    ('Belice', 'BZ'), ('Costa Rica', 'CR'), ('El Salvador', 'SV'),
                    ('Guatemala', 'GT'), ('Honduras', 'HN'), ('Nicaragua', 'NI'),
                    ('Panamá', 'PA'),
                ]
            },
            'caribbean': {
                'name': 'Caribe',
                'price': 32, 'extra_per_item': 14,
                'countries': [
                    ('Antigua y Barbuda', 'AG'), ('Bahamas', 'BS'), ('Barbados', 'BB'),
                    ('Cuba', 'CU'), ('Dominica', 'DM'), ('Granada', 'GD'),
                    ('Haití', 'HT'), ('Jamaica', 'JM'), ('República Dominicana', 'DO'),
                    ('San Cristóbal y Nieves', 'KN'), ('San Vicente y las Granadinas', 'VC'),
                    ('Santa Lucía', 'LC'), ('Trinidad y Tobago', 'TT'),
                    ('Puerto Rico', 'PR'), ('Aruba', 'AW'), ('Curazao', 'CW'),
                    ('Sint Maarten', 'SX'), ('San Martín', 'MF'),
                    ('Islas Vírgenes Británicas', 'VG'), ('Islas Vírgenes de EE.UU.', 'VI'),
                    ('Islas Caimán', 'KY'), ('Anguila', 'AI'), ('Montserrat', 'MS'),
                    ('Bermudas', 'BM'), ('Islas Turcas y Caicos', 'TC'),
                ]
            },
        }
    },
    'europe': {
        'name': 'Europa',
        'zones': {
            'europe_iberia': {
                'name': 'Europa - Península Ibérica',
                'price': 30, 'extra_per_item': 12,
                'countries': [
                    ('España', 'ES'), ('Portugal', 'PT'), ('Andorra', 'AD'),
                    ('Gibraltar', 'GI'),
                ]
            },
            'europe_western': {
                'name': 'Europa Occidental',
                'price': 35, 'extra_per_item': 14,
                'countries': [
                    ('Francia', 'FR'), ('Bélgica', 'BE'), ('Países Bajos', 'NL'),
                    ('Luxemburgo', 'LU'), ('Mónaco', 'MC'), ('Reino Unido', 'GB'),
                    ('Irlanda', 'IE'), ('Isla de Man', 'IM'),
                    ('Jersey', 'JE'), ('Guernsey', 'GG'),
                ]
            },
            'europe_central': {
                'name': 'Europa Central',
                'price': 35, 'extra_per_item': 14,
                'countries': [
                    ('Alemania', 'DE'), ('Austria', 'AT'), ('Suiza', 'CH'),
                    ('Liechtenstein', 'LI'), ('Polonia', 'PL'), ('República Checa', 'CZ'),
                    ('Eslovaquia', 'SK'), ('Hungría', 'HU'), ('Eslovenia', 'SI'),
                    ('Croacia', 'HR'),
                ]
            },
            'europe_southern': {
                'name': 'Europa del Sur',
                'price': 32, 'extra_per_item': 13,
                'countries': [
                    ('Italia', 'IT'), ('Grecia', 'GR'), ('Malta', 'MT'),
                    ('Chipre', 'CY'), ('San Marino', 'SM'), ('Ciudad del Vaticano', 'VA'),
                    ('Albania', 'AL'), ('Bosnia y Herzegovina', 'BA'),
                    ('Montenegro', 'ME'), ('Macedonia del Norte', 'MK'),
                    ('Serbia', 'RS'), ('Kosovo', 'XK'),
                ]
            },
            'europe_northern': {
                'name': 'Europa del Norte',
                'price': 40, 'extra_per_item': 16,
                'countries': [
                    ('Dinamarca', 'DK'), ('Noruega', 'NO'), ('Suecia', 'SE'),
                    ('Finlandia', 'FI'), ('Islandia', 'IS'), ('Estonia', 'EE'),
                    ('Letonia', 'LV'), ('Lituania', 'LT'),
                    ('Islas Feroe', 'FO'), ('Svalbard y Jan Mayen', 'SJ'),
                ]
            },
            'europe_eastern': {
                'name': 'Europa del Este',
                'price': 38, 'extra_per_item': 15,
                'countries': [
                    ('Rusia', 'RU'), ('Ucrania', 'UA'), ('Bielorrusia', 'BY'),
                    ('Moldavia', 'MD'), ('Rumania', 'RO'), ('Bulgaria', 'BG'),
                    ('Georgia', 'GE'), ('Armenia', 'AM'), ('Azerbaiyán', 'AZ'),
                ]
            },
        }
    },
    'asia': {
        'name': 'Asia',
        'zones': {
            'asia_east': {
                'name': 'Asia Oriental',
                'price': 45, 'extra_per_item': 18,
                'countries': [
                    ('China', 'CN'), ('Japón', 'JP'), ('Corea del Sur', 'KR'),
                    ('Corea del Norte', 'KP'), ('Mongolia', 'MN'), ('Taiwán', 'TW'),
                    ('Hong Kong', 'HK'), ('Macao', 'MO'),
                ]
            },
            'asia_southeast': {
                'name': 'Sudeste Asiático',
                'price': 42, 'extra_per_item': 16,
                'countries': [
                    ('Tailandia', 'TH'), ('Vietnam', 'VN'), ('Camboya', 'KH'),
                    ('Laos', 'LA'), ('Myanmar', 'MM'), ('Malasia', 'MY'),
                    ('Singapur', 'SG'), ('Indonesia', 'ID'), ('Filipinas', 'PH'),
                    ('Brunéi', 'BN'), ('Timor Oriental', 'TL'),
                ]
            },
            'asia_south': {
                'name': 'Asia del Sur',
                'price': 42, 'extra_per_item': 16,
                'countries': [
                    ('India', 'IN'), ('Pakistán', 'PK'), ('Bangladés', 'BD'),
                    ('Sri Lanka', 'LK'), ('Nepal', 'NP'), ('Bután', 'BT'),
                    ('Maldivas', 'MV'), ('Afganistán', 'AF'),
                ]
            },
            'asia_central': {
                'name': 'Asia Central',
                'price': 48, 'extra_per_item': 19,
                'countries': [
                    ('Kazajistán', 'KZ'), ('Uzbekistán', 'UZ'), ('Turkmenistán', 'TM'),
                    ('Tayikistán', 'TJ'), ('Kirguistán', 'KG'),
                ]
            },
            'middle_east': {
                'name': 'Medio Oriente',
                'price': 45, 'extra_per_item': 18,
                'countries': [
                    ('Turquía', 'TR'), ('Israel', 'IL'), ('Líbano', 'LB'),
                    ('Siria', 'SY'), ('Jordania', 'JO'), ('Irak', 'IQ'),
                    ('Irán', 'IR'), ('Arabia Saudita', 'SA'), ('Yemen', 'YE'),
                    ('Omán', 'OM'), ('Emiratos Árabes Unidos', 'AE'), ('Catar', 'QA'),
                    ('Baréin', 'BH'), ('Kuwait', 'KW'), ('Palestina', 'PS'),
                ]
            },
        }
    },
    'africa': {
        'name': 'África',
        'zones': {
            'africa_north': {
                'name': 'África del Norte',
                'price': 40, 'extra_per_item': 16,
                'countries': [
                    ('Marruecos', 'MA'), ('Argelia', 'DZ'), ('Túnez', 'TN'),
                    ('Libia', 'LY'), ('Egipto', 'EG'), ('Sudán', 'SD'),
                    ('Sudán del Sur', 'SS'), ('Sáhara Occidental', 'EH'),
                    ('Mauritania', 'MR'),
                ]
            },
            'africa_west': {
                'name': 'África Occidental',
                'price': 50, 'extra_per_item': 20,
                'countries': [
                    ('Nigeria', 'NG'), ('Ghana', 'GH'), ('Senegal', 'SN'),
                    ('Malí', 'ML'), ('Burkina Faso', 'BF'), ('Níger', 'NE'),
                    ('Guinea', 'GN'), ('Costa de Marfil', 'CI'), ('Liberia', 'LR'),
                    ('Sierra Leona', 'SL'), ('Togo', 'TG'), ('Benín', 'BJ'),
                    ('Gambia', 'GM'), ('Guinea-Bisáu', 'GW'), ('Cabo Verde', 'CV'),
                ]
            },
            'africa_central': {
                'name': 'África Central',
                'price': 52, 'extra_per_item': 21,
                'countries': [
                    ('Camerún', 'CM'), ('Gabón', 'GA'), ('República del Congo', 'CG'),
                    ('República Democrática del Congo', 'CD'), ('Chad', 'TD'),
                    ('República Centroafricana', 'CF'), ('Guinea Ecuatorial', 'GQ'),
                    ('Santo Tomé y Príncipe', 'ST'), ('Angola', 'AO'),
                ]
            },
            'africa_east': {
                'name': 'África Oriental',
                'price': 48, 'extra_per_item': 19,
                'countries': [
                    ('Kenia', 'KE'), ('Tanzania', 'TZ'), ('Uganda', 'UG'),
                    ('Ruanda', 'RW'), ('Burundi', 'BI'), ('Etiopía', 'ET'),
                    ('Somalia', 'SO'), ('Yibuti', 'DJ'), ('Eritrea', 'ER'),
                    ('Seychelles', 'SC'), ('Comoras', 'KM'), ('Madagascar', 'MG'),
                    ('Mauricio', 'MU'), ('Malaui', 'MW'), ('Zambia', 'ZM'),
                    ('Mozambique', 'MZ'), ('Reunión', 'RE'), ('Mayotte', 'YT'),
                ]
            },
            'africa_southern': {
                'name': 'África del Sur',
                'price': 48, 'extra_per_item': 19,
                'countries': [
                    ('Sudáfrica', 'ZA'), ('Namibia', 'NA'), ('Botsuana', 'BW'),
                    ('Zimbabue', 'ZW'), ('Lesoto', 'LS'), ('Suazilandia', 'SZ'),
                    ('Santa Elena', 'SH'),
                ]
            },
        }
    },
    'oceania': {
        'name': 'Oceanía',
        'zones': {
            'oceania_main': {
                'name': 'Oceanía - Australia y NZ',
                'price': 50, 'extra_per_item': 20,
                'countries': [
                    ('Australia', 'AU'), ('Nueva Zelanda', 'NZ'),
                ]
            },
            'oceania_islands': {
                'name': 'Oceanía - Islas del Pacífico',
                'price': 55, 'extra_per_item': 22,
                'countries': [
                    ('Papúa Nueva Guinea', 'PG'), ('Fiyi', 'FJ'), ('Islas Salomón', 'SB'),
                    ('Vanuatu', 'VU'), ('Samoa', 'WS'), ('Tonga', 'TO'),
                    ('Micronesia', 'FM'), ('Palaos', 'PW'), ('Islas Marshall', 'MH'),
                    ('Kiribati', 'KI'), ('Nauru', 'NR'), ('Tuvalu', 'TV'),
                    ('Nueva Caledonia', 'NC'), ('Polinesia Francesa', 'PF'),
                    ('Guam', 'GU'), ('Islas Cook', 'CK'), ('Niue', 'NU'),
                    ('Wallis y Futuna', 'WF'), ('Samoa Americana', 'AS'),
                    ('Islas Marianas del Norte', 'MP'),
                ]
            },
        }
    },
}

total_countries = 0
total_zones = 0

for cont_code, cont_data in CONTINENTS_DATA.items():
    continent = Continent.objects.create(name=cont_data['name'], code=cont_code)
    print(f"\n--- {continent.name} ---")

    for zone_code, zone_data in cont_data['zones'].items():
        zone = ShippingZone.objects.create(
            name=zone_data['name'],
            price=zone_data['price'],
            extra_per_item=zone_data.get('extra_per_item', 0),
            continent=continent
        )
        total_zones += 1

        for country_name, country_code in zone_data['countries']:
            Country.objects.create(
                name=country_name,
                code=country_code,
                shipping_zone=zone
            )
            total_countries += 1

        print(f"  {zone.name} (${zone.price} + ${zone.extra_per_item}/item extra) - {len(zone_data['countries'])} países")

print(f"\nDone! Created:")
print(f"  {Continent.objects.count()} continentes")
print(f"  {total_zones} zonas de envío")
print(f"  {total_countries} países")
