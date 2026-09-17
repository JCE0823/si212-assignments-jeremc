"""Run both implementations without inspecting Python source or changing reports."""
import json
from pathlib import Path
import shutil
import subprocess
import sys
import tempfile


ROOT = Path(__file__).resolve().parent


def run(command, cwd):
    result = subprocess.run(command, cwd=cwd, capture_output=True, text=True,
                            encoding="utf-8", errors="replace")
    if result.returncode:
        raise RuntimeError(
            f"{command[0]} failed (exit {result.returncode}):\n"
            f"{result.stdout}\n{result.stderr}")
    return result.stdout


def normalize(answer, label):
    if not isinstance(answer, list) or len(answer) > 3:
        raise ValueError(f"{label}: expected a list of at most three users")
    users = {}
    previous = float("inf")
    for entry in answer:
        user, count = entry["userId"], entry["genre_count"]
        if type(user) is not int or type(count) is not int or count < 0:
            raise ValueError(f"{label}: invalid user ID or genre count: {entry}")
        if user in users or count > previous:
            raise ValueError(f"{label}: duplicate user or results not sorted best first")
        users[user] = count
        previous = count
    return users


def main():
    try:
        # Copy source opaquely and run its documented command. Do not import it
        # or reuse any Python analysis logic in the independent implementation.
        with tempfile.TemporaryDirectory(prefix="task2-agreement-") as temp:
            workspace = Path(temp) / "assignment"
            shutil.copytree(ROOT, workspace, ignore=shutil.ignore_patterns(
                ".venv", ".git", "__pycache__", "results.json", "report.md"))
            run([sys.executable, "analysis.py"], workspace)
            python_answer = json.loads((workspace / "results.json").read_text(
                encoding="utf-8"))["task2"]
            js_answer = json.loads(run(["node", "task2.mjs"], workspace))
        python_users = normalize(python_answer, "Python")
        js_users = normalize(js_answer, "JavaScript")
        differences = []
        for user in sorted(python_users.keys() | js_users.keys()):
            if python_users.get(user) != js_users.get(user):
                differences.append(
                    f"userId {user}: Python={python_users.get(user, 'absent')}, "
                    f"JavaScript={js_users.get(user, 'absent')}")
        if differences:
            print("Task 2 DISAGREEMENT (genre counts):")
            print("\n".join(differences))
            print("Different tied users at the cutoff are reported as a difference.")
            return 1
        print("Task 2 agrees (tie ordering ignored):")
        print(json.dumps(js_answer, indent=2))
        return 0
    except (OSError, ValueError, KeyError, TypeError, RuntimeError) as error:
        print(f"Task 2 check FAILED: {error}", file=sys.stderr)
        return 1


if __name__ == "__main__":
    sys.exit(main())
