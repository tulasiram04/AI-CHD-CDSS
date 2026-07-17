"""add_sender_id_to_notifications

Revision ID: fcfe3ac7e8b3
Revises: 2d49a8087faf
Create Date: 2026-07-16 21:57:12.400065

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'fcfe3ac7e8b3'
down_revision: Union[str, None] = '2d49a8087faf'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    conn = op.get_bind()
    existing = {row[1] for row in conn.execute(sa.text("PRAGMA table_info(notifications)"))}
    if 'sender_id' not in existing:
        conn.execute(sa.text("ALTER TABLE notifications ADD COLUMN sender_id CHAR(32) REFERENCES users(id)"))


def downgrade() -> None:
    with op.batch_alter_table('notifications', schema=None) as batch_op:
        batch_op.drop_column('sender_id')
