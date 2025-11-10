import Foundation

struct APIResponse<T: Decodable>: Decodable {
    let data: T?
    let error: String?
    let message: String?
}

class DialAPIClient {
    private let networkManager: NetworkManager

    init(networkManager: NetworkManager) {
        self.networkManager = networkManager
    }

    func getDialState() async throws -> DialState {
        let response: APIResponse<DialState> = try await networkManager.request(
            endpoint: "/dial",
            method: "GET"
        )

        guard let data = response.data else {
            throw NetworkError.decodingError
        }

        return data
    }

    func updateDialState(_ update: UpdateDialState) async throws -> DialState {
        let response: APIResponse<DialState> = try await networkManager.request(
            endpoint: "/dial",
            method: "PATCH",
            body: update
        )

        guard let data = response.data else {
            throw NetworkError.decodingError
        }

        return data
    }

    func healthCheck() async throws -> Bool {
        struct HealthResponse: Decodable {
            let status: String
            let timestamp: String
            let service: String
            let database: String
        }

        let response: HealthResponse = try await networkManager.request(
            endpoint: "/health",
            method: "GET"
        )

        return response.status == "healthy"
    }
}
