"""rename description add data_notes

Revision ID: a1b2c3d4e5f6
Revises: 2f2b825726a8
Create Date: 2026-07-31 00:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
import sqlmodel


# revision identifiers, used by Alembic.
revision: str = 'a1b2c3d4e5f6'
down_revision: Union[str, Sequence[str], None] = '2f2b825726a8'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.alter_column('recipes', 'description', new_column_name='usage_context')
    op.add_column('recipes', sa.Column('data_notes', sqlmodel.sql.sqltypes.AutoString(), nullable=True))


def downgrade() -> None:
    op.drop_column('recipes', 'data_notes')
    op.alter_column('recipes', 'usage_context', new_column_name='description')
