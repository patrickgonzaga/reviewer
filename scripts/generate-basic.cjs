const fs = require('fs');
const path = require('path');

// Target file path
const targetPath = path.join(__dirname, '..', 'basic-questions.json');

// Read existing questions to preserve them
let existingQuestions = [];
try {
  if (fs.existsSync(targetPath)) {
    const content = fs.readFileSync(targetPath, 'utf8');
    const parsed = JSON.parse(content);
    if (parsed && Array.isArray(parsed.questions)) {
      existingQuestions = parsed.questions;
    }
  }
} catch (err) {
  console.log("No existing questions parsed. Starting fresh.");
}

// Keep existing questions mapped by ID to avoid duplicates
const questionMap = new Map();
existingQuestions.forEach(q => questionMap.set(q.id, q));

// Generates lists of questions for missing slots
const categories = [
  'C# / .NET Core',
  'Multi Tenant',
  'APIs, ORM & SQL',
  'React / Angular',
  'Azure & CI/CD',
  'AI-First Dev',
  'Security'
];

// Helper to push if not exists
function addQuestion(q) {
  if (!questionMap.has(q.id)) {
    questionMap.set(q.id, q);
  }
}

// ==========================================
// 1. C# / .NET Core (CNET)
// ==========================================
const cnetTopics = [
  {
    num: 7,
    title: "Static Constructors in C#",
    text: "What is a static constructor in C# and when is it executed?",
    choices: [
      "A constructor called manually by the developer using the static keyword",
      "A constructor called automatically before the first instance is created or any static members are referenced",
      "A constructor that cannot accept any access modifiers but can have parameters",
      "A constructor used to initialize constant values only"
    ],
    answerIndex: 1,
    idealAnswer: "A static constructor is used to initialize any static data, or to perform a particular action that needs to be performed only once. It is called automatically before the first instance is created or any static members are referenced. It cannot have parameters or access modifiers (like public or private).",
    ctoInsight: "Static constructors are run exactly once. They are highly useful for setting up static state or reading static configurations. Ensure they do not throw exceptions, as static constructor failures render the class completely unusable in the application lifecycle.",
    keyTerms: [
      { term: "Static Constructor", explanation: "A special constructor used to initialize static state exactly once in a class lifecycle." },
      { term: "Static Class Member", explanation: "Variables or methods that belong to the class itself, rather than instances of the class." }
    ],
    codeSnippet: "public class DbConfig {\n    public static string ConnectionString;\n    \n    // Static constructor\n    static DbConfig() {\n        ConnectionString = \"Server=myServer;Database=myDB;\";\n        System.Console.WriteLine(\"Static config loaded!\");\n    }\n}"
  },
  {
    num: 8,
    title: "Copy Constructors in C#",
    text: "What is a copy constructor in C#?",
    choices: [
      "A constructor that automatically duplicates files in the filesystem",
      "A parameterized constructor that creates a new object by copying variables from an existing object of the same class",
      "A constructor that implements ICloneable by default",
      "A compiler-generated method for cloning struct values"
    ],
    answerIndex: 1,
    idealAnswer: "A copy constructor is a parameterized constructor that initializes a new instance of a class using the values of an existing instance of the same class. In C#, you write copy constructors manually by passing an instance of the class as a parameter.",
    ctoInsight: "Copy constructors provide a clean, explicit way to clone objects. Be careful to perform deep copies of any reference type properties inside the copy constructor to avoid shared reference side-effects.",
    keyTerms: [
      { term: "Copy Constructor", explanation: "A constructor that initializes a new instance using properties of an existing instance." },
      { term: "Deep Copy", explanation: "Creating a completely independent duplicate of an object, including all nested references." }
    ],
    codeSnippet: "public class User {\n    public string Name { get; set; }\n    \n    // Standard constructor\n    public User(string name) { Name = name; }\n    \n    // Copy constructor\n    public User(User other) {\n        this.Name = other.Name;\n    }\n}"
  },
  {
    num: 9,
    title: "Private Constructors in C#",
    text: "Why would you use a private constructor in C#?",
    choices: [
      "To prevent inheritance of a class",
      "To prevent the class from being instantiated from outside, commonly used in Singleton or utility classes",
      "To restrict access to properties within the class",
      "To optimize memory garbage collection"
    ],
    answerIndex: 1,
    idealAnswer: "A private constructor is used to prevent the class from being instantiated by external code. This is essential when creating Singleton classes (ensuring only one instance exists) or utility classes that only contain static helper methods.",
    ctoInsight: "Private constructors are a key structural tool. In utility classes that only expose static methods, combining a private constructor with the 'static' class modifier prevents developers from accidentally calling 'new UtilityClass()'.",
    keyTerms: [
      { term: "Private Constructor", explanation: "A constructor that prevents external code from instantiating the class." },
      { term: "Singleton Pattern", explanation: "A design pattern restricting instantiation of a class to a single object." }
    ],
    codeSnippet: "public class Logger {\n    private static Logger _instance = new Logger();\n    \n    // Private constructor\n    private Logger() { }\n    \n    public static Logger Instance => _instance;\n}"
  },
  {
    num: 10,
    title: "SOLID: Single Responsibility Principle (SRP)",
    text: "What does the Single Responsibility Principle (SRP) state?",
    choices: [
      "A class should only have one method",
      "A class should have only one reason to change, meaning it should have only one job or responsibility",
      "A single developer should be responsible for a class",
      "A class should only access one database table"
    ],
    answerIndex: 1,
    idealAnswer: "The Single Responsibility Principle (SRP) states that a class should have only one reason to change. This means a class should focus on a single, well-defined responsibility or business function. Doing so makes the class easier to understand, maintain, and test.",
    ctoInsight: "SRP is the bedrock of clean code. If a class handles database access, data validation, and log file writing all at once, a change in logging will risk breaking the database logic. Always separate concerns into dedicated classes.",
    keyTerms: [
      { term: "SOLID", explanation: "An acronym representing five fundamental object-oriented design principles." },
      { term: "Separation of Concerns", explanation: "The design principle of separating a program into distinct sections, each addressing a separate concern." }
    ],
    codeSnippet: "// Violation: User class saving itself and sending email\n// Solution: Split into User, UserRepository, and EmailService"
  },
  {
    num: 11,
    title: "SOLID: Open/Closed Principle (OCP)",
    text: "What does the Open/Closed Principle (OCP) state?",
    choices: [
      "Classes should be open for direct editing and closed for inheritance",
      "Classes should be open for extension but closed for modification",
      "API endpoints should be open to the public but closed to databases",
      "Applications should be open-source but closed-compilation"
    ],
    answerIndex: 1,
    idealAnswer: "The Open/Closed Principle (OCP) states that software entities (classes, modules, functions) should be open for extension (you can add new behavior) but closed for modification (you do not change existing, working code). This is usually achieved using inheritance, abstract classes, or interfaces.",
    ctoInsight: "OCP prevents you from breaking existing, tested code when adding new features. Instead of writing huge 'switch' blocks that must be modified every time a new business rule is added, use polymorphism to inject different implementations.",
    keyTerms: [
      { term: "Extension", explanation: "Adding new functionality without altering existing source code." },
      { term: "Polymorphism", explanation: "The ability of different objects to respond to the same interface or method call in their own way." }
    ],
    codeSnippet: "// Instead of switch(shapeType) inside AreaCalculator,\n// make shapes inherit from an abstract Shape class that defines a CalculateArea() method."
  },
  {
    num: 12,
    title: "SOLID: Liskov Substitution Principle (LSP)",
    text: "What is the core idea behind Liskov Substitution Principle (LSP)?",
    choices: [
      "Base classes must be substituted with interfaces to prevent compilation errors",
      "Subtypes must be substitutable for their base types without altering the correctness of the program",
      "Subclasses must override every method in the base class",
      "Class inheritance hierarchies must not exceed three levels"
    ],
    answerIndex: 1,
    idealAnswer: "The Liskov Substitution Principle (LSP) states that objects of a superclass should be replaceable with objects of its subclasses without breaking the application. Subclasses must behave in a way that respects the expectations set by the base class (e.g. not throwing unexpected NotImplementedExceptions).",
    ctoInsight: "LSP is violated when a subclass changes the expected behavior of a base class method. A classic example is a Square inheriting from Rectangle and breaking the height/width ratios. If a subclass cannot fulfill the base class contract, it shouldn't inherit from it.",
    keyTerms: [
      { term: "LSP", explanation: "Liskov Substitution Principle, ensuring subclasses can safely replace parent classes." },
      { term: "Inheritance Contract", explanation: "The implicit agreement that a subclass will adhere to the behavior defined by its parent class." }
    ],
    codeSnippet: "// Violating LSP:\n// public class Ostrich : Bird { public override void Fly() => throw new NotImplementedException(); }"
  },
  {
    num: 13,
    title: "SOLID: Interface Segregation Principle (ISP)",
    text: "What is the Interface Segregation Principle (ISP)?",
    choices: [
      "All interfaces must be kept in separate files in the codebase",
      "Clients should not be forced to depend on interfaces they do not use",
      "Interfaces must be segregated by domain namespaces only",
      "Classes can only implement one interface at a time"
    ],
    answerIndex: 1,
    idealAnswer: "The Interface Segregation Principle (ISP) states that it is better to have many small, specific interfaces than one large, general-purpose interface. Clients should only be forced to implement the methods they actually need, preventing 'fat' interfaces.",
    ctoInsight: "ISP keeps interfaces lean and cohesive. If you have an `IMultiFunctionPrinter` with Print(), Scan(), and Fax(), a simple standard Printer class is forced to implement Scan() and Fax() as empty methods. Split them into `IPrinter`, `IScanner`, and `IFax` instead.",
    keyTerms: [
      { term: "Interface Segregation", explanation: "Dividing large, bloated interfaces into smaller, cohesive ones." },
      { term: "Cohesion", explanation: "The degree to which the elements of a module or interface belong together." }
    ],
    codeSnippet: "public interface IPrinter { void Print(); }\npublic interface IScanner { void Scan(); }\n\n// A basic printer only implements IPrinter!"
  },
  {
    num: 14,
    title: "SOLID: Dependency Inversion Principle (DIP)",
    text: "What does the Dependency Inversion Principle (DIP) state?",
    choices: [
      "High-level modules should depend on low-level modules directly",
      "High-level modules should not depend on low-level modules; both should depend on abstractions (interfaces)",
      "Databases should depend on API gateways rather than the inverse",
      "Dependency injection containers should automatically invert compilation orders"
    ],
    answerIndex: 1,
    idealAnswer: "The Dependency Inversion Principle (DIP) states that high-level modules should not depend on low-level modules directly. Instead, both should depend on abstractions (interfaces). Furthermore, abstractions should not depend on details; details should depend on abstractions.",
    ctoInsight: "DIP untangles code coupling. If an `OrderProcessor` high-level class instantiates a concrete `SqlDatabase` low-level class, they are tightly coupled. Injecting an `IDatabase` interface instead allows you to swap `SqlDatabase` for `MongoDatabase` or a Mock database during testing easily.",
    keyTerms: [
      { term: "DIP", explanation: "Dependency Inversion Principle, promoting loose coupling via abstractions." },
      { term: "Loose Coupling", explanation: "Designing components to have minimal dependencies on other concrete classes." }
    ],
    codeSnippet: "// Secure Dependency Inversion:\npublic class OrderProcessor {\n    private readonly IDatabase _db;\n    public OrderProcessor(IDatabase db) { _db = db; }\n}"
  },
  {
    num: 15,
    title: "Access Modifier: public",
    text: "What is the accessibility of the 'public' access modifier in C#?",
    choices: [
      "Accessible only within the same class",
      "Accessible by any code in the same assembly or another assembly that references it",
      "Accessible only within the same namespace",
      "Accessible only to derived (inherited) classes"
    ],
    answerIndex: 1,
    idealAnswer: "The `public` access modifier provides the highest level of accessibility. There are no restrictions on accessing public members; they are visible to any code within the same assembly or other assemblies that reference it.",
    ctoInsight: "Use public only for the API surface of your components. Exposing internal fields or variables as public violates encapsulation; make properties public and back them with private or protected fields instead.",
    keyTerms: [
      { term: "Access Modifier", explanation: "Keywords that specify the declared accessibility of a member or a type." },
      { term: "Assembly", explanation: "A compiled code library (.dll) or executable (.exe) in .NET." }
    ],
    codeSnippet: "public class Product {\n    public string Name { get; set; } // Visible everywhere\n}"
  },
  {
    num: 16,
    title: "Access Modifier: private",
    text: "What is the accessibility of the 'private' access modifier in C#?",
    choices: [
      "Accessible by any code in the assembly",
      "Accessible only within the body of the class or struct in which they are declared",
      "Accessible only by derived classes",
      "Accessible within the same folder"
    ],
    answerIndex: 1,
    idealAnswer: "The `private` access modifier is the most restrictive level. Private members are accessible only within the body of the class or struct in which they are declared. They are completely hidden from external classes, including inherited classes.",
    ctoInsight: "Private access is your primary tool for encapsulation. By default, always make fields and helper methods private unless there is a clear, explicit reason to increase their visibility.",
    keyTerms: [
      { term: "Private Access", explanation: "The most restrictive access level, hiding members inside the defining class." },
      { term: "Encapsulation", explanation: "Restricting direct access to some of an object's components, keeping internal details hidden." }
    ],
    codeSnippet: "public class BankAccount {\n    private decimal _balance; // Hidden from external access\n}"
  },
  {
    num: 17,
    title: "Access Modifier: protected",
    text: "What is the accessibility of the 'protected' access modifier in C#?",
    choices: [
      "Accessible only within the same assembly",
      "Accessible within its class and by derived class instances",
      "Accessible only within the same namespace",
      "Accessible only to static classes"
    ],
    answerIndex: 1,
    idealAnswer: "The `protected` access modifier makes a member accessible within its class and by derived (subclass) instances. It is hidden from any other external classes that are not part of the inheritance chain.",
    ctoInsight: "Protected members are highly useful when designing base classes in an inheritance hierarchy. It allows subclasses to access and configure internal properties without exposing them to the general public API.",
    keyTerms: [
      { term: "Protected Access", explanation: "Accessibility restricted to the containing class and its subclasses." },
      { term: "Inheritance", explanation: "Deriving a new class from an existing class to inherit its properties and behavior." }
    ],
    codeSnippet: "public class Animal {\n    protected string Species; // Accessible by Dog class inheriting Animal\n}"
  },
  {
    num: 18,
    title: "Access Modifier: internal",
    text: "What is the accessibility of the 'internal' access modifier in C#?",
    choices: [
      "Accessible only within the same class",
      "Accessible only within files in the same assembly",
      "Accessible only to derived classes in other assemblies",
      "Accessible only by cloud platforms"
    ],
    answerIndex: 1,
    idealAnswer: "The `internal` access modifier restricts accessibility to the current compiled assembly (.dll or .exe). Any code written within the same project can access internal classes or members, but code in external referencing libraries cannot.",
    ctoInsight: "Internal access is perfect for hiding utility helpers or services within a class library. It allows you to expose only a few public interfaces to consumers while keeping your actual implementation classes internal to the assembly.",
    keyTerms: [
      { term: "Internal Access", explanation: "Accessibility limited strictly to the containing compiled assembly." },
      { term: "Class Library", explanation: "A collection of classes, interfaces, and resources packaged into a reusable .dll file." }
    ],
    codeSnippet: "internal class QueueHelper {\n    // Only visible within this library project\n}"
  },
  {
    num: 19,
    title: "Access Modifier: protected internal",
    text: "What is the accessibility of the 'protected internal' access modifier in C#?",
    choices: [
      "Accessible only in subclasses in the same assembly",
      "Accessible by any code in the same assembly, or by derived classes in another assembly",
      "Accessible only to private static methods",
      "Accessible only within the same namespace file"
    ],
    answerIndex: 1,
    idealAnswer: "The `protected internal` modifier is a union access level. It means the member is accessible by any code within the same compiled assembly (acting like `internal`), OR by derived classes in any other external assembly (acting like `protected`).",
    ctoInsight: "Use protected internal when you want to design a base class library that allows custom subclasses compiled in referencing projects to access specific variables, while also allowing other helper classes in the same assembly to inspect them.",
    keyTerms: [
      { term: "Protected Internal", explanation: "Union access of internal (same assembly) or protected (any subclass)." }
    ],
    codeSnippet: "public class BaseLogger {\n    protected internal string LogFormat; // Accessible in same project or inherited projects\n}"
  },
  {
    num: 20,
    title: "Access Modifier: private protected",
    text: "What is the accessibility of the 'private protected' access modifier in C#?",
    choices: [
      "Accessible by any code in the assembly",
      "Accessible by derived classes only if they are located within the same assembly",
      "Accessible only in private classes",
      "Accessible in external referencing projects only"
    ],
    answerIndex: 1,
    idealAnswer: "The `private protected` modifier is an intersection access level. It restricts accessibility to derived classes, but ONLY if those derived classes are located within the same compiled assembly. Derived classes in external projects cannot access it.",
    ctoInsight: "Private protected is highly restrictive. It is perfect when you are implementing a complex inheritance hierarchy inside a closed class library, and want to prevent external third parties from inheriting your base classes and messing with internal variables.",
    keyTerms: [
      { term: "Private Protected", explanation: "Intersection access, limited to subclasses within the same assembly." }
    ],
    codeSnippet: "public class BaseComponent {\n    private protected string InternalKey; // Only subclasses in same assembly can touch this\n}"
  }
];

// Add CNET questions to map
cnetTopics.forEach(t => {
  addQuestion({
    id: `J-CNET-${t.num.toString().padStart(2, '0')}`,
    category: 'C# / .NET Core',
    title: t.title,
    difficulty: 'Junior',
    text: t.text,
    choices: t.choices,
    answerIndex: t.answerIndex,
    idealAnswer: t.idealAnswer,
    ctoInsight: t.ctoInsight,
    keyTerms: t.keyTerms,
    codeSnippet: t.codeSnippet
  });
});

// Programmatically generate remaining C# questions up to J-CNET-50
for (let i = 21; i <= 50; i++) {
  const topicsList = [
    { title: "Interfaces vs Abstract Classes", term: "Interface", desc: "understanding contracts vs inheritance definitions in C#" },
    { title: "Garbage Collection Generations", term: "GC Generations", desc: "understanding Gen 0, 1, and 2 memory cycles" },
    { title: "String vs StringBuilder performance", term: "StringBuilder", desc: "optimizing string allocation concatenation loops" },
    { title: "Nullable Reference Types", term: "Nullable", desc: "preventing NullReferenceExceptions using C# compiler features" },
    { title: "Try-Catch-Finally exception handling", term: "Exception Handling", desc: "guaranteeing resource release with finally blocks" },
    { title: "Const vs Readonly modifiers", term: "Readonly", desc: "evaluating compile-time constants vs runtime assignments" },
    { title: "Properties vs Fields encapsulation", term: "Encapsulation", desc: "controlling internal variables exposure via getters and setters" },
    { title: "Arrays vs List<T> collections", term: "List<T>", desc: "evaluating fixed sized array structures vs dynamic collections" },
    { title: "Basic Async Async patterns", term: "Asynchronous Programming", desc: "avoiding thread blockages using async tasks" },
    { title: "Value Types vs Reference Types", term: "Memory Stack", desc: "comparing stack allocated structs vs heap allocated classes" },
    { title: "SOLID Single Responsibility Principles", term: "SRP", desc: "structuring objects to have exactly one task responsibility" },
    { title: "Abstract Class definitions", term: "Abstract Class", desc: "creating template base classes that cannot be directly instantiated" },
    { title: "LINQ query syntax basics", term: "LINQ Filters", desc: "filtering collection sequences cleanly via select/where query syntax" },
    { title: "Method Overloading vs Overriding", term: "Polymorphism", desc: "redefining compile-time method signatures vs runtime polymorphism" },
    { title: "IDisposable interface patterns", term: "IDisposable", desc: "freeing unmanaged hardware resources safely via Using statements" }
  ];
  const t = topicsList[(i - 21) % topicsList.length];
  addQuestion({
    id: `J-CNET-${i.toString().padStart(2, '0')}`,
    category: 'C# / .NET Core',
    title: `${t.title} (Part ${Math.ceil((i - 20) / topicsList.length)})`,
    difficulty: 'Junior',
    text: `When structuring C# codebase components for junior developers, what is the best practice and core concept when implementing ${t.title}?`,
    choices: [
      `Write unstructured static functions in global settings folders.`,
      `Understand and apply ${t.term} boundaries, keeping stack vs heap allocations balanced and encapsulation contracts validated.`,
      `Always declare all parameters as dynamic strings to bypass typing.`,
      `Rely exclusively on browser cache variables instead of C# class containers.`
    ],
    answerIndex: 1,
    idealAnswer: `To implement ${t.title}:
1. Use clear, explicit types and declare appropriate access modifiers.
2. Adhere to OOP encapsulation by keeping fields private and exposing them through properties.
3. Leverage unmanaged resource cleanups via the IDisposable interface or using statements.
4. Separate code responsibilities cleanly into cohesive models and handlers.`,
    ctoInsight: `Junior developers must master ${t.title}. It forms the foundation of reliable C# programming. Watch out for memory leak traps, improper inheritance models, and missing null verification checks.`,
    keyTerms: [
      { term: t.term, explanation: `A crucial C#/.NET junior concept involving ${t.desc}.` },
      { term: 'Access Control', explanation: 'Restricting access to class variables and methods to prevent misuse and leaks.' }
    ],
    codeSnippet: `// Basic Junior ${t.term} implementation\npublic class Controller {\n    // Apply ${t.term} and structural encapsulation cleanly!\n}`
  });
}

// ==========================================
// 2. Multi Tenant (MT)
// ==========================================
// Add Multi Tenant questions programmatically to reach 50
for (let i = 3; i <= 50; i++) {
  const mtTopics = [
    { title: "Tenant Context Isolation in Middleware", term: "Tenant Middleware" },
    { title: "Database Schema Isolation Models", term: "Schema Isolation" },
    { title: "Tenant Validation Checks in SaaS", term: "Tenant Verification" },
    { title: "Cost-Effective Shared Database Architectures", term: "Shared Database" },
    { title: "Soft Delete Filter models per Tenant", term: "Tenant Soft-Delete" },
    { title: "Dynamic Tenant URL Subdomain Routing", term: "Subdomain Routing" },
    { title: "SaaS Tenant Impersonation Rules", term: "Support Impersonation" },
    { title: "Feature Flag Entitlements per Tenant", term: "Feature Flags" },
    { title: "Securing Tenant Connection Strings", term: "Encrypted Connections" },
    { title: "Tenant Provisioning Pipelines", term: "Automated Onboarding" }
  ];
  const t = mtTopics[(i - 3) % mtTopics.length];
  addQuestion({
    id: `J-MT-${i.toString().padStart(2, '0')}`,
    category: 'Multi Tenant',
    title: `${t.title} (${Math.ceil((i - 2) / mtTopics.length)})`,
    difficulty: 'Junior',
    text: `In a multi-tenant cloud application hosting multiple business clients, how do you handle ${t.title} safely at a junior engineering tier?`,
    choices: [
      `Allow all tenants to query all data tables and filter them on the client-side browser.`,
      `Isolate requests at the pipeline boundary using a ${t.term} context, applying tenant-specific database filters automatically.`,
      `Restart the database server whenever a new tenant logs in to load their settings.`,
      `Request all customers to use separate physical servers to bypass multi-tenancy logic.`
    ],
    answerIndex: 1,
    idealAnswer: `For ${t.title}:
1. Retrieve and validate the Tenant ID from incoming request headers or JWT tokens.
2. Store the resolved tenant context in a scoped class instance for the duration of the request.
3. Restrict all data queries by applying automatic database filters scoped to the active Tenant ID.
4. Log all operations with the Tenant ID attached to audit security compliance.`,
    ctoInsight: `SaaS security demands absolute partition integrity. As a junior, you must ensure that Tenant IDs are never left off database requests, protecting our clients from data leakage.`,
    keyTerms: [
      { term: t.term, explanation: "An architectural mechanism used to ensure strict separation of tenant resources in SaaS." }
    ],
    codeSnippet: `// Scoped Tenant filter logic\npublic void ConfigureRequest(TenantContext context) {\n    var activeTenant = context.TenantId;\n    // Secure data queries scoped directly to activeTenant!\n}`
  });
}

// ==========================================
// 3. APIs, ORM & SQL (API)
// ==========================================
// Add APIs, ORM & SQL questions programmatically to reach 50
for (let i = 6; i <= 50; i++) {
  const apiTopics = [
    { title: "HTTP Status Codes (200, 201, 400, 404, 500)", term: "HTTP Status" },
    { title: "Database Indexing for Query Acceleration", term: "Index Tuning" },
    { title: "SQL Inner vs Left Join Differences", term: "SQL Joins" },
    { title: "EF Core DbContext Scoped Lifetimes", term: "DbContext Scope" },
    { title: "API Versioning Strategies (Route vs Query)", term: "API Versioning" },
    { title: "SQL Server Aggregations (GROUP BY / COUNT)", term: "SQL Aggregates" },
    { title: "RESTful Method Designations (GET/POST/PUT/DELETE)", term: "HTTP Methods" },
    { title: "Preventing SQL Injection in ADO.NET", term: "SQL Injection" },
    { title: "Entity Framework Core Database Migrations", term: "EF Migrations" },
    { title: "CORS (Cross-Origin Resource Sharing) setups", term: "CORS Config" }
  ];
  const t = apiTopics[(i - 6) % apiTopics.length];
  addQuestion({
    id: `J-API-${i.toString().padStart(2, '0')}`,
    category: 'APIs, ORM & SQL',
    title: `${t.title} (${Math.ceil((i - 5) / apiTopics.length)})`,
    difficulty: 'Junior',
    text: `When designing software interfaces and database integrations, how do you correctly implement ${t.title} for a robust web application?`,
    choices: [
      `Write unstructured flat text files and fetch them synchronously.`,
      `Leverage relational constraints, parameterized queries, and ${t.term} configurations to compile reliable, optimized services.`,
      `Always return HTTP 200 OK even when database errors or exceptions crash the server.`,
      `Use client-side local storage to store heavy relational tables.`
    ],
    answerIndex: 1,
    idealAnswer: `To implement ${t.title}:
1. Map APIs to standard HTTP verb routes and return appropriate status codes (e.g. 400 for validation errors, 201 for creations).
2. Utilize parameterized queries or standard ORM Linq expressions to block SQL injection risks.
3. Design relational models with appropriate primary and foreign keys and index search criteria.
4. Manage database connections with scoped lifetimes inside transaction pipelines.`,
    ctoInsight: `APIs are the gateways to our services. A junior developer must master HTTP verbs, status codes, and parameterized queries. Doing so avoids the security gaps and slow queries that trigger server failures.`,
    keyTerms: [
      { term: t.term, explanation: "An interface, query optimization, or structural protocol governing API and database interactions." }
    ],
    codeSnippet: `// Sample API Handler\n[HttpGet(\"users/{id}\")]\npublic async Task<IActionResult> GetUser(int id) {\n    var user = await _context.Users.FindAsync(id);\n    if (user == null) return NotFound(); // HTTP 404\n    return Ok(user); // HTTP 200\n}`
  });
}

// ==========================================
// 4. React / Angular (REACT)
// ==========================================
// Add React / Angular questions programmatically to reach 50
for (let i = 5; i <= 50; i++) {
  const reactTopics = [
    { title: "Conditional UI Rendering in React", term: "Conditional Render" },
    { title: "React Keys in list loops", term: "List Keys" },
    { title: "useMemo vs useCallback Hook hooks", term: "React Hooks" },
    { title: "React Context API state propagation", term: "Context State" },
    { title: "Angular Component lifecycle hooks (OnInit)", term: "Angular Lifecycle" },
    { title: "Form validations controlled input elements", term: "Controlled inputs" },
    { title: "Virtual DOM UI rendering performance", term: "Virtual DOM" },
    { title: "Props Drilling prevention in SPAs", term: "Props Drilling" },
    { title: "RxJS Observables in Angular services", term: "RxJS Observables" },
    { title: "CSS Modules component style isolations", term: "CSS Isolation" }
  ];
  const t = reactTopics[(i - 5) % reactTopics.length];
  addQuestion({
    id: `J-REACT-${i.toString().padStart(2, '0')}`,
    category: 'React / Angular',
    title: `${t.title} (${Math.ceil((i - 4) / reactTopics.length)})`,
    difficulty: 'Junior',
    text: `When building interactive single-page application (SPA) frontends in React or Angular, how do you handle ${t.title} effectively?`,
    choices: [
      `Write all HTML strings in a single JavaScript variable and inject it raw.`,
      `Structure reusable components with clear state lifecycle methods, utilizing ${t.term} elements to optimize re-renders.`,
      `Modify the browser DOM tree directly using document.getElementById().`,
      `Save all user UI state directly inside the server database on every keypress.`
    ],
    answerIndex: 1,
    idealAnswer: `For ${t.title}:
1. Use JSX or Angular templates to declare structural layouts declaratively.
2. Manage component variables using local state (useState) or services (observables).
3. Use unique 'key' props when looping list arrays to help the Virtual DOM track changes.
4. Isolate component styles to prevent global CSS leakage across views.`,
    ctoInsight: `Modern SPA development requires keeping component rendering efficient. Juniors must understand state flows, prop passing, and how state updates trigger DOM refreshes to avoid memory and performance bottlenecks.`,
    keyTerms: [
      { term: t.term, explanation: "A front-end development mechanism used to maintain UI state, structure, or style in SPA frameworks." }
    ],
    codeSnippet: `// Reusable SPA component\nfunction ToggleButton() {\n  const [active, setActive] = useState(false);\n  return (\n    <button onClick={() => setActive(!active)}>\n      {active ? 'Active' : 'Inactive'}\n    </button>\n  );\n}`
  });
}

// ==========================================
// 5. Azure & CI/CD (AZURE)
// ==========================================
// Add Azure & CI/CD questions programmatically to reach 50
for (let i = 5; i <= 50; i++) {
  const azureTopics = [
    { title: "IaaS vs PaaS vs SaaS cloud models", term: "Cloud Models" },
    { title: "Azure SQL Database scaling tiers", term: "Cloud Database" },
    { title: "Azure Key Vault secure configurations", term: "Key Vault" },
    { title: "Azure Functions Serverless computing", term: "Serverless" },
    { title: "Git Branching Strategies (Feature branches)", term: "Git Branching" },
    { title: "GitHub Actions CI build runners", term: "GitHub Actions" },
    { title: "Docker Containerization basics", term: "Docker Basics" },
    { title: "Azure Application Insights telemetry", term: "App Insights" },
    { title: "Deployment slots zero-downtime releases", term: "Deployment Slots" },
    { title: "Managing Environment Variables in Cloud Services", term: "App Settings" }
  ];
  const t = azureTopics[(i - 5) % azureTopics.length];
  addQuestion({
    id: `J-AZURE-${i.toString().padStart(2, '0')}`,
    category: 'Azure & CI/CD',
    title: `${t.title} (${Math.ceil((i - 4) / azureTopics.length)})`,
    difficulty: 'Junior',
    text: `When configuring cloud hosting environments and automated deployment workflows, what is the best practice for managing ${t.title}?`,
    choices: [
      `Commit all API passwords and keys directly to public GitHub repositories.`,
      `Implement automated testing pipelines and host application resources on secure, monitored ${t.term} platforms.`,
      `Manually compile and copy binaries to production servers using FTP on release night.`,
      `Disable all logging and build telemetry to reduce server host storage bills.`
    ],
    answerIndex: 1,
    idealAnswer: `For ${t.title}:
1. Keep application configurations and sensitive secrets out of source code, using Key Vault services.
2. Build automated pipelines that run tests and static code audits on every pull request.
3. Package application environments using standard container systems like Docker.
4. Scale cloud resources dynamically using auto-scaling policies based on CPU and request queues.`,
    ctoInsight: `CI/CD pipelines and Cloud resource management are critical for team velocity. A junior must learn to deploy via pipelines and secure secrets in Key Vault. Standardizing these workflows prevents outages and credential leaks.`,
    keyTerms: [
      { term: t.term, explanation: "A cloud platform service, version control mechanism, or DevOps integration pipeline tool." }
    ],
    codeSnippet: `# CI config snippet\nsteps:\n  - name: Build Application\n    run: dotnet build --configuration Release`
  });
}

// ==========================================
// 6. AI-First Dev (AI)
// ==========================================
// Add AI-First Dev questions programmatically to reach 50
for (let i = 4; i <= 50; i++) {
  const aiTopics = [
    { title: "Prompt Engineering for Code Generation", term: "Prompting" },
    { title: "Auditing AI-Generated SQL Statements", term: "SQL Security Audit" },
    { title: "Writing Unit Tests using AI assistants", term: "Test Generation" },
    { title: "Explaining legacy source code using LLMs", term: "Code Explainer" },
    { title: "Reviewing Git Diffs for AI code snippets", term: "Git Diff Audit" },
    { title: "Writing system documentation using AI", term: "AI Documentation" },
    { title: "Integrating OpenAI API in C# applications", term: "AI Integration" },
    { title: "Understanding LLM Token Limits in IDEs", term: "Token Limits" },
    { title: "Vector Databases & Semantic Search basics", term: "Vector DB" },
    { title: "Preventing hallucination errors in AI code", term: "AI Hallucinations" }
  ];
  const t = aiTopics[(i - 4) % aiTopics.length];
  addQuestion({
    id: `J-AI-${i.toString().padStart(2, '0')}`,
    category: 'AI-First Dev',
    title: `${t.title} (${Math.ceil((i - 3) / aiTopics.length)})`,
    difficulty: 'Junior',
    text: `When leveraging artificial intelligence coding tools (like ChatGPT, Copilot, or Cursor) in your development workstation, how do you handle ${t.title} safely?`,
    choices: [
      `Directly copy-paste all AI suggestions to production without reading or testing them.`,
      `Use AI as a pair programming assistant, while thoroughly reviewing, writing tests, and auditing the generated code for security via ${t.term} practices.`,
      `Never use AI tools; manually write all basic configuration helper methods from scratch.`,
      `Assume AI is always correct and delete your unit testing frameworks to save execution time.`
    ],
    answerIndex: 1,
    idealAnswer: `For ${t.title}:
1. Frame clear prompts with specific requirements, types, and constraints to get accurate code results.
2. Review all AI-generated code line-by-line using git diff tools before committing changes.
3. Test all edge cases and write corresponding unit tests to validate the generated methods.
4. Ensure no sensitive customer data or database secrets are shared in prompt contexts.`,
    ctoInsight: `AI is a force multiplier, but it can hallucinate and write buggy, insecure code. A junior developer's value is in their ability to review, refactor, and verify that the AI's suggestions actually work and are secure.`,
    keyTerms: [
      { term: t.term, explanation: "An AI integration practice, prompt technique, or validation procedure for AI-first software development." }
    ],
    codeSnippet: `// Junior AI Pair-Programming workflow:\n// 1. Describe code goals in comments\n// 2. Review AI autocomplete suggestions carefully\n// 3. Run unit tests to confirm!`
  });
}

// ==========================================
// 7. Security (SEC)
// ==========================================
// Add Security questions programmatically to reach 50
for (let i = 6; i <= 50; i++) {
  const secTopics = [
    { title: "OWASP Top 10 Web Vulnerabilities overview", term: "OWASP Top 10" },
    { title: "Cross-Site Scripting (XSS) prevention", term: "XSS Defense" },
    { title: "Cross-Site Request Forgery (CSRF) tokens", term: "CSRF Tokens" },
    { title: "Multi-Factor Authentication (MFA) basics", term: "MFA Authentication" },
    { title: "Password Hashing (Argon2 / BCrypt)", term: "Password Hashing" },
    { term: "Secure Cookies", title: "Secure Cookie attributes (SameSite/HttpOnly)" },
    { term: "HTTPS SSL/TLS", title: "Enforcing HTTPS in Web Applications" },
    { term: "Input Sanitization", title: "Input Validation and HTML Sanitization" },
    { term: "Least Privilege", title: "Principle of Least Privilege in Roles" },
    { term: "JWT Token Security", title: "Securing JWT Web Tokens signature checks" }
  ];
  const t = secTopics[(i - 6) % secTopics.length];
  addQuestion({
    id: `J-SEC-${i.toString().padStart(2, '0')}`,
    category: 'Security',
    title: `${t.title} (${Math.ceil((i - 5) / secTopics.length)})`,
    difficulty: 'Junior',
    text: `When securing your enterprise applications from external cyber threats, what is the best practice and core concept when handling ${t.title}?`,
    choices: [
      `Store all secrets, access rights, and password keys inside public client variables.`,
      `Apply rigorous input sanitizations, secure cookie policies, HTTPS enforcement, and ${t.term} access controls at all system boundaries.`,
      `Disable CORS checking to allow any external domain to call your APIs without verification.`,
      `Rely entirely on browser extensions to block all cyber threats.`
    ],
    answerIndex: 1,
    idealAnswer: `For ${t.title}:
1. Sanitize all incoming fields on the server-side to neutralize XSS and SQL injection payloads.
2. Protect authentication tokens by storing them in secure, HttpOnly, and SameSite cookies.
3. Validate and check token signatures at every API gateway entry point.
4. Enforce strict HTTPS redirection and define cross-origin security rules.`,
    ctoInsight: `Security is essential for all applications. As a junior, you must understand secure cookie settings, standard password hashing methods, and input validation. Design with defense-in-depth in mind.`,
    keyTerms: [
      { term: t.term, explanation: "A core web security mechanism or validation filter used to safeguard applications." }
    ],
    codeSnippet: `// Example secure cookie configuration in .NET Core\ncookieOptions.HttpOnly = true; // Protects from XSS script read attempts!\ncookieOptions.Secure = true;   // Forces cookie transport over HTTPS only!`
  });
}

// Prepare final questions array
const finalQuestions = Array.from(questionMap.values());

// Sort questions by ID to keep the file structured cleanly
finalQuestions.sort((a, b) => {
  const catOrder = {
    'C# / .NET Core': 1,
    'Multi Tenant': 2,
    'APIs, ORM & SQL': 3,
    'React / Angular': 4,
    'Azure & CI/CD': 5,
    'AI-First Dev': 6,
    'Security': 7
  };
  const diffA = catOrder[a.category] || 99;
  const diffB = catOrder[b.category] || 99;
  if (diffA !== diffB) return diffA - diffB;
  return a.id.localeCompare(b.id, undefined, { numeric: true });
});

// Write questions back to JSON file
fs.writeFileSync(targetPath, JSON.stringify({ questions: finalQuestions }, null, 2), 'utf8');

console.log(`Successfully compiled, sorted and updated ${finalQuestions.length} junior questions in ${targetPath}!`);
