import unittest

from backend.validation.validators import (
    check_phase_one_point,
    check_phase_one_infeasibility_certificate,
    check_pivot_result,
    check_primal_dual_certificate,
    is_feasible_sef,
    pivot_matrix,
    verify_unbounded_certificate,
    verify_weak_duality,
)


class MathematicalValidatorTests(unittest.TestCase):
    def test_sef_feasibility(self):
        self.assertTrue(is_feasible_sef([[1, 1]], [3], [1, 2]))
        self.assertFalse(is_feasible_sef([[1, 1]], [3], [-1, 4]))

    def test_unbounded_certificate(self):
        matrix = [[1, -1]]
        self.assertTrue(verify_unbounded_certificate(matrix, [0], [1, 0], [0, 0], [1, 1]))
        self.assertFalse(verify_unbounded_certificate(matrix, [0], [-1, 0], [0, 0], [1, 1]))

    def test_weak_duality(self):
        self.assertTrue(verify_weak_duality(12, 12))
        self.assertTrue(verify_weak_duality(9, 12))
        self.assertFalse(verify_weak_duality(13, 12))

    def test_primal_dual_optimality_certificate(self):
        matrix = [[1, 1], [1, 0], [0, 1]]
        result = check_primal_dual_certificate(
            matrix,
            rhs=[4, 2, 3],
            objective=[3, 2],
            primal_point=[2, 2],
            dual_point=[2, 1, 0],
        )
        self.assertTrue(result.valid)
        self.assertEqual(result.primal_objective, 10)
        self.assertEqual(result.dual_objective, 10)
        self.assertEqual(result.max_complementarity_residual, 0)

    def test_feasible_nonoptimal_pair_fails_gap_and_cs(self):
        result = check_primal_dual_certificate(
            [[1, 1], [1, 0], [0, 1]],
            rhs=[4, 2, 3],
            objective=[3, 2],
            primal_point=[1, 1],
            dual_point=[2, 1, 0],
        )
        self.assertTrue(result.primal_feasible)
        self.assertTrue(result.dual_feasible)
        self.assertFalse(result.objectives_agree)
        self.assertFalse(result.complementary_slackness)
        self.assertEqual(result.objective_gap, 5)

    def test_primal_and_dual_violations_are_reported(self):
        primal_bad = check_primal_dual_certificate(
            [[1, 1], [1, 0], [0, 1]],
            rhs=[4, 2, 3],
            objective=[3, 2],
            primal_point=[3, 1],
            dual_point=[2, 1, 0],
        )
        self.assertFalse(primal_bad.primal_feasible)
        self.assertEqual(primal_bad.max_primal_violation, 1)

        dual_bad = check_primal_dual_certificate(
            [[1, 1], [1, 0], [0, 1]],
            rhs=[4, 2, 3],
            objective=[3, 2],
            primal_point=[2, 2],
            dual_point=[1, 1, 0],
        )
        self.assertFalse(dual_bad.dual_feasible)
        self.assertEqual(dual_bad.max_dual_violation, 1)

    def test_primal_dual_checker_rejects_bad_dimensions_and_nonfinite_data(self):
        with self.assertRaises(ValueError):
            check_primal_dual_certificate([[1, 1]], [1], [1], [1], [1])
        with self.assertRaises(ValueError):
            check_primal_dual_certificate([[1]], [float("inf")], [1], [1], [1])
        with self.assertRaises(ValueError):
            check_primal_dual_certificate([[1]], [1], [1], [1], [1], tolerance=-1)

    def test_phase_one_zero_artificials_certify_original_feasibility(self):
        result = check_phase_one_point(
            [[1, 1], [2, 1]],
            rhs=[3, 4],
            original_point=[1, 2],
            artificial_point=[0, 0],
        )
        self.assertTrue(result.auxiliary_feasible)
        self.assertTrue(result.certifies_original_feasibility)
        self.assertEqual(result.artificial_objective, 0)

    def test_positive_phase_one_point_does_not_claim_infeasibility(self):
        result = check_phase_one_point(
            [[1, 1], [2, 1]],
            rhs=[3, 4],
            original_point=[0, 0],
            artificial_point=[3, 4],
        )
        self.assertTrue(result.auxiliary_feasible)
        self.assertFalse(result.certifies_original_feasibility)
        self.assertEqual(result.artificial_objective, 7)

    def test_phase_one_reports_residuals_and_requires_normalized_rhs(self):
        result = check_phase_one_point(
            [[1, 1]],
            rhs=[3],
            original_point=[-1, 2],
            artificial_point=[1],
        )
        self.assertFalse(result.auxiliary_feasible)
        self.assertEqual(result.max_equality_residual, 1)
        self.assertEqual(result.max_nonnegativity_violation, 1)
        with self.assertRaises(ValueError):
            check_phase_one_point([[1]], [-1], [0], [0])

    def test_phase_one_matching_bound_certifies_infeasibility(self):
        result = check_phase_one_infeasibility_certificate(
            [[1], [1]],
            rhs=[1, 2],
            original_point=[1],
            artificial_point=[0, 1],
            dual_point=[1, -1],
        )
        self.assertTrue(result.certifies_original_infeasibility)
        self.assertEqual(result.phase_one_objective, -1)
        self.assertEqual(result.dual_bound, -1)
        self.assertEqual(result.objective_gap, 0)

    def test_phase_one_certificate_rejects_dual_violation(self):
        result = check_phase_one_infeasibility_certificate(
            [[1], [1]],
            rhs=[1, 2],
            original_point=[1],
            artificial_point=[0, 1],
            dual_point=[-1, -1],
        )
        self.assertFalse(result.dual_feasible)
        self.assertFalse(result.certifies_original_infeasibility)
        self.assertEqual(result.max_dual_violation, 2)

    def test_zero_phase_one_optimum_does_not_certify_infeasibility(self):
        result = check_phase_one_infeasibility_certificate(
            [[1]],
            rhs=[1],
            original_point=[1],
            artificial_point=[0],
            dual_point=[0],
        )
        self.assertTrue(result.auxiliary_feasible)
        self.assertTrue(result.dual_feasible)
        self.assertTrue(result.objectives_agree)
        self.assertFalse(result.negative_optimum)
        self.assertFalse(result.certifies_original_infeasibility)

    def test_tableau_pivot_matches_textbook_row_operation(self):
        matrix = [
            [2, 2, -1, 0, 3],
            [0, 3, 2, 3, -5],
            [3, -1, -2, 1, 5],
        ]
        expected = [
            [2, 3.5, 0, 1.5, 0.5],
            [0, 1.5, 1, 1.5, -2.5],
            [3, 2, 0, 4, 0],
        ]
        self.assertEqual(pivot_matrix(matrix, 1, 2), expected)
        result = check_pivot_result(matrix, expected, 1, 2)
        self.assertTrue(result.valid)
        self.assertEqual(result.pivot_column_residual, 0)

    def test_pivot_checker_reports_an_incorrect_entry(self):
        matrix = [[1, 2], [3, 4]]
        proposed = [[0.5, 0], [0.75, 1]]
        result = check_pivot_result(matrix, proposed, 1, 1)
        self.assertFalse(result.valid)
        self.assertEqual(result.max_abs_error, 1)

    def test_pivot_rejects_zero_element_and_bad_shape(self):
        with self.assertRaises(ValueError):
            pivot_matrix([[1, 0], [0, 1]], 0, 1)
        with self.assertRaises(ValueError):
            pivot_matrix([[1, 2], [3]], 0, 0)
        with self.assertRaises(IndexError):
            pivot_matrix([[1]], 1, 0)


if __name__ == "__main__":
    unittest.main()
