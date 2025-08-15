// jest-dom adds custom jest matchers for asserting on DOM nodes.
// allows you to do things like:
// expect(element).toHaveTextContent(/react/i)
// learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom';

// Globally mock axios to avoid transforming ESM in node_modules during tests
jest.mock('axios', () => {
	const mockAxios = {
		create: jest.fn(() => mockAxios),
		get: jest.fn(() => Promise.resolve({ data: {} })),
		post: jest.fn(() => Promise.resolve({ data: {} })),
		put: jest.fn(() => Promise.resolve({ data: {} })),
		delete: jest.fn(() => Promise.resolve({ data: {} })),
		interceptors: {
			request: { use: jest.fn() },
			response: { use: jest.fn() },
		},
	};
	return { __esModule: true, default: mockAxios };
});

// Mock lottie-react to avoid HTMLCanvas usage in jsdom
jest.mock('lottie-react', () => ({ __esModule: true, default: () => null }));

// Mock sweetalert2 to avoid stylesheet parsing in jsdom
jest.mock('sweetalert2', () => ({
	__esModule: true,
	default: {
		fire: jest.fn(),
		mixin: jest.fn(() => ({ fire: jest.fn() })),
	},
}));
