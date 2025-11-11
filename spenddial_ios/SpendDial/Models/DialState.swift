import Foundation

struct DialState: Codable, Identifiable {
    let id: String
    let userId: String
    let todayBudget: Double
    let remaining: Double
    let spent: Double
    let lastCalculated: Date
    let createdAt: Date
    let updatedAt: Date

    enum CodingKeys: String, CodingKey {
        case id, userId, todayBudget, remaining, spent, lastCalculated, createdAt, updatedAt
    }

    init(from decoder: Decoder) throws {
        let container = try decoder.container(keyedBy: CodingKeys.self)
        id = try container.decode(String.self, forKey: .id)
        userId = try container.decode(String.self, forKey: .userId)
        todayBudget = try container.decode(Double.self, forKey: .todayBudget)
        remaining = try container.decode(Double.self, forKey: .remaining)
        spent = try container.decode(Double.self, forKey: .spent)

        let dateFormatter = ISO8601DateFormatter()

        let lastCalculatedString = try container.decode(String.self, forKey: .lastCalculated)
        lastCalculated = dateFormatter.date(from: lastCalculatedString) ?? Date()

        let createdAtString = try container.decode(String.self, forKey: .createdAt)
        createdAt = dateFormatter.date(from: createdAtString) ?? Date()

        let updatedAtString = try container.decode(String.self, forKey: .updatedAt)
        updatedAt = dateFormatter.date(from: updatedAtString) ?? Date()
    }
}

struct UpdateDialState: Codable {
    var todayBudget: Double?
    var remaining: Double?
    var spent: Double?
}
