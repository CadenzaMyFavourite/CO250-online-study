"""Small deterministic validators for course examples and certificates."""

from __future__ import annotations

from dataclasses import dataclass
from math import isclose, isfinite


@dataclass(frozen=True)
class PrimalDualCertificateCheck:
    """Diagnostics for the inequality-form primal/dual pair.

    The convention is

        max c^T x  subject to A x <= b, x >= 0,
        min b^T y  subject to A^T y >= c, y >= 0.
    """

    primal_feasible: bool
    dual_feasible: bool
    objectives_agree: bool
    complementary_slackness: bool
    primal_objective: float
    dual_objective: float
    objective_gap: float
    max_primal_violation: float
    max_dual_violation: float
    max_complementarity_residual: float

    @property
    def valid(self) -> bool:
        return (
            self.primal_feasible
            and self.dual_feasible
            and self.objectives_agree
            and self.complementary_slackness
        )


@dataclass(frozen=True)
class PhaseOnePointCheck:
    """Diagnostics for ``A x + z = b``, ``x, z >= 0``, ``min 1^T z``.

    The rows must first be normalized so ``b >= 0``. A feasible auxiliary
    point with zero artificial objective certifies feasibility of the original
    standard-equality-form system. A positive value at one point alone does not
    certify infeasibility; the Phase I optimum must be positive for that claim.
    """

    auxiliary_feasible: bool
    artificial_objective: float
    zero_artificial_objective: bool
    max_equality_residual: float
    max_nonnegativity_violation: float

    @property
    def certifies_original_feasibility(self) -> bool:
        return self.auxiliary_feasible and self.zero_artificial_objective


@dataclass(frozen=True)
class PhaseOneInfeasibilityCertificateCheck:
    """Diagnostics for a matching primal/dual Phase I certificate."""

    auxiliary_feasible: bool
    dual_feasible: bool
    objectives_agree: bool
    negative_optimum: bool
    phase_one_objective: float
    dual_bound: float
    objective_gap: float
    max_dual_violation: float

    @property
    def certifies_original_infeasibility(self) -> bool:
        return self.auxiliary_feasible and self.dual_feasible and self.objectives_agree and self.negative_optimum


@dataclass(frozen=True)
class PivotResultCheck:
    """Diagnostics for a proposed Gauss-Jordan pivot result."""

    valid: bool
    max_abs_error: float
    pivot_column_residual: float


def mat_vec(matrix: list[list[float]], vector: list[float]) -> list[float]:
    if any(len(row) != len(vector) for row in matrix):
        raise ValueError("matrix and vector dimensions do not agree")
    return [sum(value * vector[index] for index, value in enumerate(row)) for row in matrix]


def dot(left: list[float], right: list[float]) -> float:
    if len(left) != len(right):
        raise ValueError("vector dimensions do not agree")
    return sum(a * b for a, b in zip(left, right))


def _max_or_zero(values: list[float]) -> float:
    return max(values, default=0.0)


def _validate_primal_dual_dimensions(
    matrix: list[list[float]],
    rhs: list[float],
    objective: list[float],
    primal_point: list[float],
    dual_point: list[float],
    tolerance: float,
) -> None:
    row_count = len(matrix)
    column_count = len(objective)
    if tolerance < 0:
        raise ValueError("tolerance must be nonnegative")
    if len(rhs) != row_count or len(dual_point) != row_count:
        raise ValueError("matrix row count must match rhs and dual dimensions")
    if len(primal_point) != column_count:
        raise ValueError("objective and primal dimensions do not agree")
    if any(len(row) != column_count for row in matrix):
        raise ValueError("matrix column count must match objective dimension")
    scalars = [
        tolerance,
        *rhs,
        *objective,
        *primal_point,
        *dual_point,
        *(entry for row in matrix for entry in row),
    ]
    if not all(isfinite(value) for value in scalars):
        raise ValueError("certificate data must contain only finite numbers")


def check_primal_dual_certificate(
    matrix: list[list[float]],
    rhs: list[float],
    objective: list[float],
    primal_point: list[float],
    dual_point: list[float],
    tolerance: float = 1e-9,
) -> PrimalDualCertificateCheck:
    """Check feasibility, objective agreement, and complementary slackness.

    This uses the standard inequality-form pair documented on
    :class:`PrimalDualCertificateCheck`. Residuals are returned so a caller can
    explain why a proposed certificate fails.
    """

    _validate_primal_dual_dimensions(matrix, rhs, objective, primal_point, dual_point, tolerance)

    primal_activity = mat_vec(matrix, primal_point)
    primal_slacks = [bound - activity for bound, activity in zip(rhs, primal_activity)]
    dual_activity = [
        sum(matrix[row][column] * dual_point[row] for row in range(len(matrix)))
        for column in range(len(objective))
    ]
    dual_slacks = [activity - coefficient for activity, coefficient in zip(dual_activity, objective)]

    max_primal_violation = _max_or_zero([
        *[max(-slack, 0.0) for slack in primal_slacks],
        *[max(-value, 0.0) for value in primal_point],
    ])
    max_dual_violation = _max_or_zero([
        *[max(-slack, 0.0) for slack in dual_slacks],
        *[max(-value, 0.0) for value in dual_point],
    ])

    primal_objective = dot(objective, primal_point)
    dual_objective = dot(rhs, dual_point)
    objective_gap = dual_objective - primal_objective
    complementarity_residuals = [
        *[abs(multiplier * slack) for multiplier, slack in zip(dual_point, primal_slacks)],
        *[abs(value * slack) for value, slack in zip(primal_point, dual_slacks)],
    ]
    max_complementarity_residual = _max_or_zero(complementarity_residuals)

    return PrimalDualCertificateCheck(
        primal_feasible=max_primal_violation <= tolerance,
        dual_feasible=max_dual_violation <= tolerance,
        objectives_agree=abs(objective_gap) <= tolerance,
        complementary_slackness=max_complementarity_residual <= tolerance,
        primal_objective=primal_objective,
        dual_objective=dual_objective,
        objective_gap=objective_gap,
        max_primal_violation=max_primal_violation,
        max_dual_violation=max_dual_violation,
        max_complementarity_residual=max_complementarity_residual,
    )


def check_phase_one_point(
    matrix: list[list[float]],
    rhs: list[float],
    original_point: list[float],
    artificial_point: list[float],
    tolerance: float = 1e-9,
) -> PhaseOnePointCheck:
    """Check a proposed point for the normalized Phase I auxiliary problem."""

    if tolerance < 0:
        raise ValueError("tolerance must be nonnegative")
    if len(matrix) != len(rhs) or len(artificial_point) != len(rhs):
        raise ValueError("matrix row count must match rhs and artificial dimensions")
    if any(len(row) != len(original_point) for row in matrix):
        raise ValueError("matrix column count must match original-point dimension")
    scalars = [
        tolerance,
        *rhs,
        *original_point,
        *artificial_point,
        *(entry for row in matrix for entry in row),
    ]
    if not all(isfinite(value) for value in scalars):
        raise ValueError("Phase I data must contain only finite numbers")
    if any(value < -tolerance for value in rhs):
        raise ValueError("Phase I rows must be normalized so rhs is nonnegative")

    activity = mat_vec(matrix, original_point)
    equality_residuals = [
        activity_value + artificial_value - bound
        for activity_value, artificial_value, bound in zip(activity, artificial_point, rhs)
    ]
    max_equality_residual = _max_or_zero([abs(value) for value in equality_residuals])
    max_nonnegativity_violation = _max_or_zero([
        *[max(-value, 0.0) for value in original_point],
        *[max(-value, 0.0) for value in artificial_point],
    ])
    artificial_objective = sum(artificial_point)

    return PhaseOnePointCheck(
        auxiliary_feasible=(
            max_equality_residual <= tolerance
            and max_nonnegativity_violation <= tolerance
        ),
        artificial_objective=artificial_objective,
        zero_artificial_objective=abs(artificial_objective) <= tolerance,
        max_equality_residual=max_equality_residual,
        max_nonnegativity_violation=max_nonnegativity_violation,
    )


def pivot_matrix(
    matrix: list[list[float]],
    pivot_row: int,
    pivot_column: int,
    tolerance: float = 1e-12,
) -> list[list[float]]:
    """Return the matrix obtained by pivoting on a nonzero element.

    Row and column indices are zero-based. The pivot row is divided by the
    pivot element, then that column is eliminated from every other row.
    """

    if tolerance < 0:
        raise ValueError("tolerance must be nonnegative")
    if not matrix or not matrix[0]:
        raise ValueError("matrix must be nonempty")
    column_count = len(matrix[0])
    if any(len(row) != column_count for row in matrix):
        raise ValueError("matrix must be rectangular")
    if not 0 <= pivot_row < len(matrix) or not 0 <= pivot_column < column_count:
        raise IndexError("pivot position is outside the matrix")
    if not all(isfinite(value) for row in matrix for value in row):
        raise ValueError("matrix must contain only finite numbers")

    pivot = matrix[pivot_row][pivot_column]
    if abs(pivot) <= tolerance:
        raise ValueError("pivot element must be nonzero")

    normalized_pivot_row = [value / pivot for value in matrix[pivot_row]]
    result: list[list[float]] = []
    for row_index, row in enumerate(matrix):
        if row_index == pivot_row:
            result.append(normalized_pivot_row.copy())
            continue
        multiplier = row[pivot_column]
        result.append([
            value - multiplier * normalized_value
            for value, normalized_value in zip(row, normalized_pivot_row)
        ])
    return result


def check_phase_one_infeasibility_certificate(
    matrix: list[list[float]],
    rhs: list[float],
    original_point: list[float],
    artificial_point: list[float],
    dual_point: list[float],
    tolerance: float = 1e-9,
) -> PhaseOneInfeasibilityCertificateCheck:
    """Certify a negative optimum for the course Phase I maximization LP.

    The auxiliary primal is ``max -1^T u`` subject to ``A x + u = b``
    and ``x, u >= 0``. Its dual is ``min b^T y`` subject to
    ``A^T y >= 0`` and ``y >= -1``. Matching feasible objective values
    prove the Phase I optimum; a negative optimum proves the original
    standard-equality-form system is infeasible.
    """

    auxiliary = check_phase_one_point(matrix, rhs, original_point, artificial_point, tolerance)
    if len(dual_point) != len(rhs):
        raise ValueError("dual dimension must match the Phase I row count")
    if not all(isfinite(value) for value in dual_point):
        raise ValueError("Phase I dual point must contain only finite numbers")

    dual_activity = [
        sum(matrix[row][column] * dual_point[row] for row in range(len(matrix)))
        for column in range(len(original_point))
    ]
    max_dual_violation = _max_or_zero([
        *[max(-value, 0.0) for value in dual_activity],
        *[max(-1.0 - value, 0.0) for value in dual_point],
    ])
    phase_one_objective = -sum(artificial_point)
    dual_bound = dot(rhs, dual_point)
    objective_gap = dual_bound - phase_one_objective

    return PhaseOneInfeasibilityCertificateCheck(
        auxiliary_feasible=auxiliary.auxiliary_feasible,
        dual_feasible=max_dual_violation <= tolerance,
        objectives_agree=abs(objective_gap) <= tolerance,
        negative_optimum=phase_one_objective < -tolerance,
        phase_one_objective=phase_one_objective,
        dual_bound=dual_bound,
        objective_gap=objective_gap,
        max_dual_violation=max_dual_violation,
    )


def check_pivot_result(
    matrix: list[list[float]],
    proposed_result: list[list[float]],
    pivot_row: int,
    pivot_column: int,
    tolerance: float = 1e-9,
) -> PivotResultCheck:
    """Compare a proposed tableau update with the exact pivot operation."""

    expected = pivot_matrix(matrix, pivot_row, pivot_column, tolerance=min(tolerance, 1e-12))
    if len(proposed_result) != len(expected) or any(
        len(row) != len(expected[0]) for row in proposed_result
    ):
        raise ValueError("proposed pivot result has incorrect dimensions")
    if not all(isfinite(value) for row in proposed_result for value in row):
        raise ValueError("proposed pivot result must contain only finite numbers")

    max_abs_error = _max_or_zero([
        abs(actual - wanted)
        for actual_row, expected_row in zip(proposed_result, expected)
        for actual, wanted in zip(actual_row, expected_row)
    ])
    pivot_column_residual = _max_or_zero([
        abs(row[pivot_column] - (1.0 if row_index == pivot_row else 0.0))
        for row_index, row in enumerate(proposed_result)
    ])
    return PivotResultCheck(
        valid=max_abs_error <= tolerance,
        max_abs_error=max_abs_error,
        pivot_column_residual=pivot_column_residual,
    )


def is_feasible_sef(matrix: list[list[float]], rhs: list[float], point: list[float], tolerance: float = 1e-9) -> bool:
    if len(matrix) != len(rhs) or any(value < -tolerance for value in point):
        return False
    return all(isclose(actual, expected, abs_tol=tolerance) for actual, expected in zip(mat_vec(matrix, point), rhs))


def verify_unbounded_certificate(
    matrix: list[list[float]],
    rhs: list[float],
    objective: list[float],
    base_point: list[float],
    direction: list[float],
    tolerance: float = 1e-9,
) -> bool:
    return (
        is_feasible_sef(matrix, rhs, base_point, tolerance)
        and all(value >= -tolerance for value in direction)
        and all(abs(value) <= tolerance for value in mat_vec(matrix, direction))
        and dot(objective, direction) > tolerance
    )


def verify_weak_duality(primal_value: float, dual_value: float, tolerance: float = 1e-9) -> bool:
    return primal_value <= dual_value + tolerance
