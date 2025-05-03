from ..db import get_db_connection

def initialise_db():
    conn = get_db_connection()
    cur = conn.cursor()

    cur.execute('''
        CREATE TABLE IF NOT EXISTS users (
            username VARCHAR(50) PRIMARY KEY,
            email VARCHAR(100) UNIQUE NOT NULL,
            password_hash VARCHAR(200) NOT NULL,
            created_at TIMESTAMP DEFAULT NOW()
        )       
    ''')
                
    cur.execute('''
        CREATE TABLE IF NOT EXISTS users (
            username VARCHAR(50) PRIMARY KEY,
            email VARCHAR(100) UNIQUE NOT NULL,
            password_hash VARCHAR(200) NOT NULL,
            created_at TIMESTAMP DEFAULT NOW()
        )
    ''')

    cur.execute('''
        CREATE TABLE IF NOT EXISTS compositions (
            id SERIAL PRIMARY KEY,
            username VARCHAR(50) REFERENCES users(username) ON DELETE CASCADE,
            raag_name TEXT NOT NULL,
            taal_name TEXT NOT NULL,
            lay TEXT NOT NULL,
            source_name TEXT,
            source_page INTEGER,
            created_at TIMESTAMP DEFAULT NOW()
        )
    ''')

    cur.execute('''
        CREATE TABLE IF NOT EXISTS kern_headers (
            composition_id INTEGER PRIMARY KEY REFERENCES compositions(id) ON DELETE CASCADE,
            global_header TEXT[] NOT NULL
        )
    ''')

    cur.execute('''
        DO $$
        BEGIN
            IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'section_type') THEN
                CREATE TYPE section_type AS ENUM (
                    'sthayee', 'sthayee_antara_transition', 'antara',
                    'antara_sanchari_transition', 'sanchari',
                    'sanchari_aabhog_transition', 'aabhog'
                );
            END IF;
        END
        $$;
    ''')

    cur.execute('''
        CREATE TABLE IF NOT EXISTS kern_sections (
            id SERIAL PRIMARY KEY,
            composition_id INTEGER NOT NULL REFERENCES compositions(id) ON DELETE CASCADE,
            section_type section_type NOT NULL,
            section_header TEXT NOT NULL,
            kern_data TEXT[] NOT NULL,
            sequence_order INTEGER NOT NULL,
            UNIQUE(composition_id, section_type)
        )
    ''')

    cur.execute('''
        CREATE TABLE IF NOT EXISTS change_logs (
            id SERIAL PRIMARY KEY,
            username VARCHAR(50) REFERENCES users(username) ON DELETE CASCADE,
            total_sam_taali_changes INTEGER DEFAULT 0,
            total_row_changes INTEGER DEFAULT 0,
            total_prediction_changes INTEGER DEFAULT 0,
            created_at TIMESTAMP DEFAULT NOW()
        )
    ''')


    cur.close()
    conn.close()
