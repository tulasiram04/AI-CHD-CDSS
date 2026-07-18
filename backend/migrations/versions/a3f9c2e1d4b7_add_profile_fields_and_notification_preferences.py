"""add_profile_fields_and_notification_preferences

Revision ID: a3f9c2e1d4b7
Revises: fdd1ed7ca5bd
Create Date: 2026-07-18 16:35:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision: str = 'a3f9c2e1d4b7'
down_revision: Union[str, None] = 'fdd1ed7ca5bd'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # --- Extend doctor_profiles table ---
    op.add_column('doctor_profiles', sa.Column('full_name', sa.String(length=100), nullable=True))
    op.add_column('doctor_profiles', sa.Column('phone', sa.String(length=30), nullable=True))
    op.add_column('doctor_profiles', sa.Column('experience', sa.String(length=50), nullable=True))
    op.add_column('doctor_profiles', sa.Column('qualification', sa.String(length=200), nullable=True))
    op.add_column('doctor_profiles', sa.Column('designation', sa.String(length=100), nullable=True))
    op.add_column('doctor_profiles', sa.Column('hospital', sa.String(length=200), nullable=True))
    op.add_column('doctor_profiles', sa.Column('emergency_contact', sa.String(length=100), nullable=True))
    op.add_column('doctor_profiles', sa.Column('office_extension', sa.String(length=20), nullable=True))
    op.add_column('doctor_profiles', sa.Column('photo_url', sa.String(length=512), nullable=True))
    op.add_column('doctor_profiles', sa.Column('bio', sa.Text(), nullable=True))
    op.add_column('doctor_profiles', sa.Column('last_password_changed_at', sa.DateTime(), nullable=True))
    op.add_column('doctor_profiles', sa.Column('medical_council', sa.String(length=150), nullable=True))
    op.add_column('doctor_profiles', sa.Column('license_expiry', sa.Date(), nullable=True))

    # --- Create notification_preferences table ---
    op.create_table(
        'notification_preferences',
        sa.Column('id', sa.Uuid(), nullable=False),
        sa.Column('user_id', sa.Uuid(), nullable=False),
        sa.Column('pref_prediction', sa.Boolean(), nullable=False, server_default=sa.text('true')),
        sa.Column('pref_high_risk', sa.Boolean(), nullable=False, server_default=sa.text('true')),
        sa.Column('pref_new_patient', sa.Boolean(), nullable=False, server_default=sa.text('true')),
        sa.Column('pref_critical', sa.Boolean(), nullable=False, server_default=sa.text('true')),
        sa.Column('pref_report', sa.Boolean(), nullable=False, server_default=sa.text('true')),
        sa.Column('pref_email', sa.Boolean(), nullable=False, server_default=sa.text('true')),
        sa.Column('pref_browser', sa.Boolean(), nullable=False, server_default=sa.text('true')),
        sa.Column('pref_system', sa.Boolean(), nullable=False, server_default=sa.text('false')),
        sa.Column('pref_sms', sa.Boolean(), nullable=False, server_default=sa.text('false')),
        sa.Column('browser_permission', sa.String(length=20), nullable=False, server_default='default'),
        sa.Column('updated_at', sa.DateTime(), nullable=False, server_default=sa.func.now()),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('user_id'),
    )


def downgrade() -> None:
    op.drop_table('notification_preferences')
    op.drop_column('doctor_profiles', 'license_expiry')
    op.drop_column('doctor_profiles', 'medical_council')
    op.drop_column('doctor_profiles', 'last_password_changed_at')
    op.drop_column('doctor_profiles', 'bio')
    op.drop_column('doctor_profiles', 'photo_url')
    op.drop_column('doctor_profiles', 'office_extension')
    op.drop_column('doctor_profiles', 'emergency_contact')
    op.drop_column('doctor_profiles', 'hospital')
    op.drop_column('doctor_profiles', 'designation')
    op.drop_column('doctor_profiles', 'qualification')
    op.drop_column('doctor_profiles', 'experience')
    op.drop_column('doctor_profiles', 'phone')
    op.drop_column('doctor_profiles', 'full_name')
