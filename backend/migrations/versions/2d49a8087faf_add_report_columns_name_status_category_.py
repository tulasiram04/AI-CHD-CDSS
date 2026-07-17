"""add_report_columns_name_status_category_pinned_nullable_fks

Revision ID: 2d49a8087faf
Revises: 4b087e11f1ec
Create Date: 2026-07-16 14:50:15.969682

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '2d49a8087faf'
down_revision: Union[str, None] = '4b087e11f1ec'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    conn = op.get_bind()

    # Check existing columns and add only missing ones (idempotent)
    existing = {row[1] for row in conn.execute(sa.text("PRAGMA table_info(reports)"))}

    if 'name' not in existing:
        conn.execute(sa.text("ALTER TABLE reports ADD COLUMN name VARCHAR(255) NOT NULL DEFAULT 'Untitled Report'"))
    if 'category' not in existing:
        conn.execute(sa.text("ALTER TABLE reports ADD COLUMN category VARCHAR(50) NOT NULL DEFAULT 'clinical'"))
    if 'status' not in existing:
        conn.execute(sa.text("ALTER TABLE reports ADD COLUMN status VARCHAR(50) NOT NULL DEFAULT 'Ready'"))
    if 'pinned' not in existing:
        conn.execute(sa.text("ALTER TABLE reports ADD COLUMN pinned BOOLEAN NOT NULL DEFAULT 0"))
    if 'updated_at' not in existing:
        conn.execute(sa.text("ALTER TABLE reports ADD COLUMN updated_at DATETIME NOT NULL DEFAULT (datetime('now'))"))

    # Make patient_id and admission_id nullable via batch recreation (one at a time to avoid circular dep)
    with op.batch_alter_table('reports', schema=None) as batch_op:
        batch_op.alter_column('patient_id', existing_type=sa.CHAR(length=32), nullable=True)

    with op.batch_alter_table('reports', schema=None) as batch_op:
        batch_op.alter_column('admission_id', existing_type=sa.CHAR(length=32), nullable=True)


def downgrade() -> None:
    with op.batch_alter_table('reports', schema=None) as batch_op:
        batch_op.drop_column('name')
        batch_op.drop_column('category')
        batch_op.drop_column('status')
        batch_op.drop_column('pinned')
        batch_op.drop_column('updated_at')
        batch_op.alter_column('patient_id', existing_type=sa.CHAR(length=32), nullable=False)
        batch_op.alter_column('admission_id', existing_type=sa.CHAR(length=32), nullable=False)

