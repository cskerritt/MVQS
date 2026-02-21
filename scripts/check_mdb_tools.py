#!/usr/bin/env python3
"""
Validate required mdb-tools commands for MVQS legacy-sync workflows.

Usage:
  python3 scripts/check_mdb_tools.py
"""

from __future__ import annotations

import shutil
import sys


def main() -> int:
    required = ["mdb-export", "mdb-sql", "mdb-schema"]
    missing = [tool for tool in required if shutil.which(tool) is None]
    if missing:
        print(
            "FAIL: missing required mdb-tools commands: "
            + ", ".join(missing)
            + ". Install mdb-tools and retry.",
            file=sys.stderr,
        )
        return 1
    print("PASS: mdb-tools prerequisites available (mdb-export, mdb-sql, mdb-schema).")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
